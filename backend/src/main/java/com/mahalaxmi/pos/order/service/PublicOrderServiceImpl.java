package com.mahalaxmi.pos.order.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mahalaxmi.pos.common.exception.ResourceNotFoundException;
import com.mahalaxmi.pos.common.ratelimit.PublicEndpointRateLimiter;
import com.mahalaxmi.pos.menu.entity.MenuItem;
import com.mahalaxmi.pos.menu.repository.MenuItemRepository;
import com.mahalaxmi.pos.order.dto.PublicOrderItemSubmissionRequest;
import com.mahalaxmi.pos.order.dto.PublicOrderSubmissionRequest;
import com.mahalaxmi.pos.order.dto.PublicOrderSubmissionResponse;
import com.mahalaxmi.pos.order.dto.PublicOrderTrackingResponse;
import com.mahalaxmi.pos.order.entity.*;
import com.mahalaxmi.pos.order.repository.OrderIdempotencyKeyRepository;
import com.mahalaxmi.pos.order.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class PublicOrderServiceImpl implements PublicOrderService {

    private static final Logger log = LoggerFactory.getLogger(PublicOrderServiceImpl.class);
    private static final DateTimeFormatter WEB_ORDER_FMT = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");

    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final OrderIdempotencyKeyRepository idempotencyKeyRepository;
    private final PublicEndpointRateLimiter rateLimiter;
    private final ObjectMapper objectMapper;

    public PublicOrderServiceImpl(OrderRepository orderRepository,
                                  MenuItemRepository menuItemRepository,
                                  OrderIdempotencyKeyRepository idempotencyKeyRepository,
                                  PublicEndpointRateLimiter rateLimiter,
                                  ObjectMapper objectMapper) {
        this.orderRepository = orderRepository;
        this.menuItemRepository = menuItemRepository;
        this.idempotencyKeyRepository = idempotencyKeyRepository;
        this.rateLimiter = rateLimiter;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public PublicOrderSubmissionResponse submitPublicOrder(PublicOrderSubmissionRequest request, String clientIp) {
        // 1. Rate Limiting Check
        rateLimiter.checkRateLimit(clientIp);

        // 2. Database-backed Idempotency Check
        Optional<OrderIdempotencyKey> existingKeyOpt = idempotencyKeyRepository.findByIdempotencyKey(request.idempotencyKey());
        if (existingKeyOpt.isPresent()) {
            OrderIdempotencyKey existingKey = existingKeyOpt.get();
            if (existingKey.getExpiresAt().isAfter(LocalDateTime.now())) {
                try {
                    log.info("Returning cached order response for idempotency key: {}", request.idempotencyKey());
                    return objectMapper.readValue(existingKey.getResponsePayload(), PublicOrderSubmissionResponse.class);
                } catch (Exception e) {
                    log.warn("Failed to parse cached response for idempotency key {}: {}", request.idempotencyKey(), e.getMessage());
                }
            }
        }

        // 3. Merge quantities and validate all items
        Map<Long, Integer> mergedQuantities = new LinkedHashMap<>();
        for (PublicOrderItemSubmissionRequest itemReq : request.items()) {
            mergedQuantities.merge(itemReq.menuItemId(), itemReq.quantity(), Integer::sum);
        }

        Order order = new Order();
        order.setOrderNumber(generateWebsiteOrderNumber());
        order.setOrderType(OrderType.PARCEL);
        order.setOrderSource(OrderSource.WEBSITE);
        order.setAcceptanceStatus(AcceptanceStatus.PENDING);
        order.setStatus(OrderStatus.OPEN);
        order.setCustomerName(request.customerName().trim());
        order.setCustomerPhone(request.customerPhone().trim());
        order.setPickupNotes(request.pickupNotes() != null && !request.pickupNotes().isBlank() ? request.pickupNotes().trim() : null);
        order.setTrackingToken(UUID.randomUUID().toString().replace("-", ""));

        // Server-side authoritative price calculation - NEVER trust client prices
        for (Map.Entry<Long, Integer> entry : mergedQuantities.entrySet()) {
            MenuItem menuItem = menuItemRepository.findById(entry.getKey())
                    .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + entry.getKey()));

            if (!menuItem.isAvailable()) {
                throw new IllegalArgumentException("Menu item is currently unavailable: " + menuItem.getName());
            }

            OrderItem orderItem = new OrderItem(menuItem, entry.getValue());
            order.addItem(orderItem);
        }

        Order saved = orderRepository.save(order);
        log.info("New website order submitted: {} (Total: ₹{}, Items: {}, Tracking: {})",
                saved.getOrderNumber(), saved.getTotalAmount(), saved.getItems().size(), saved.getTrackingToken());

        PublicOrderSubmissionResponse response = new PublicOrderSubmissionResponse(
                saved.getOrderNumber(),
                saved.getTrackingToken(),
                saved.getStatus(),
                saved.getAcceptanceStatus(),
                saved.getTotalAmount(),
                25, // Standard estimated parcel preparation time: 25 mins
                "Your takeaway order has been submitted. Our staff will confirm and prepare it fresh.",
                saved.getCreatedAt()
        );

        // 4. Persist idempotency record
        try {
            String payload = objectMapper.writeValueAsString(response);
            OrderIdempotencyKey idempotencyRecord = new OrderIdempotencyKey(
                    request.idempotencyKey(),
                    saved,
                    payload,
                    LocalDateTime.now().plusHours(24)
            );
            idempotencyKeyRepository.save(idempotencyRecord);
        } catch (Exception e) {
            log.error("Could not persist idempotency payload for key {}: {}", request.idempotencyKey(), e.getMessage());
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PublicOrderTrackingResponse trackPublicOrder(String trackingToken) {
        if (trackingToken == null || trackingToken.isBlank()) {
            throw new ResourceNotFoundException("Invalid tracking token");
        }

        Order order = orderRepository.findByTrackingTokenWithItems(trackingToken.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with provided tracking token"));

        List<PublicOrderTrackingResponse.PublicOrderItemDetail> itemDetails = order.getItems().stream()
                .filter(i -> i.getStatus() == OrderItemStatus.ACTIVE)
                .map(i -> new PublicOrderTrackingResponse.PublicOrderItemDetail(
                        i.getItemName(),
                        i.getQuantity(),
                        i.getUnitPrice(),
                        i.getSubtotal()
                ))
                .toList();

        return new PublicOrderTrackingResponse(
                order.getOrderNumber(),
                order.getStatus(),
                order.getAcceptanceStatus(),
                order.getTotalAmount(),
                order.getPickupNotes(),
                itemDetails,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }

    private String generateWebsiteOrderNumber() {
        String timestamp = LocalDateTime.now().format(WEB_ORDER_FMT);
        int randomSuffix = 100 + new Random().nextInt(900);
        return "WEB-" + timestamp + "-" + randomSuffix;
    }
}
