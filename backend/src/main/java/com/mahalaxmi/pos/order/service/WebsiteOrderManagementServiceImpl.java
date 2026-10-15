package com.mahalaxmi.pos.order.service;

import com.mahalaxmi.pos.common.exception.ResourceNotFoundException;
import com.mahalaxmi.pos.order.dto.OrderResponse;
import com.mahalaxmi.pos.order.entity.AcceptanceStatus;
import com.mahalaxmi.pos.order.entity.Order;
import com.mahalaxmi.pos.order.entity.OrderItemStatus;
import com.mahalaxmi.pos.order.entity.OrderSource;
import com.mahalaxmi.pos.order.entity.OrderStatus;
import com.mahalaxmi.pos.order.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WebsiteOrderManagementServiceImpl implements WebsiteOrderManagementService {

    private static final Logger log = LoggerFactory.getLogger(WebsiteOrderManagementServiceImpl.class);

    private final OrderRepository orderRepository;

    public WebsiteOrderManagementServiceImpl(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getWebsiteOrders(AcceptanceStatus acceptanceStatus) {
        AcceptanceStatus filterStatus = acceptanceStatus != null ? acceptanceStatus : AcceptanceStatus.PENDING;
        List<Order> orders = orderRepository.findByOrderSourceAndAcceptanceStatusWithItems(
                OrderSource.WEBSITE,
                filterStatus
        );

        return orders.stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long getPendingWebsiteOrderCount() {
        return orderRepository.countByOrderSourceAndAcceptanceStatus(
                OrderSource.WEBSITE,
                AcceptanceStatus.PENDING
        );
    }

    @Override
    @Transactional
    public OrderResponse acceptWebsiteOrder(Long orderId, String username) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Website order not found with id: " + orderId));

        if (order.getOrderSource() != OrderSource.WEBSITE) {
            throw new IllegalArgumentException("Order " + order.getOrderNumber() + " is not a website order");
        }

        if (order.getAcceptanceStatus() != AcceptanceStatus.PENDING) {
            throw new IllegalStateException("Website order is already " + order.getAcceptanceStatus());
        }

        order.setAcceptanceStatus(AcceptanceStatus.ACCEPTED);
        String auditNote = "Accepted by " + (username != null ? username : "staff");
        order.setNotes(order.getNotes() != null ? order.getNotes() + " | " + auditNote : auditNote);

        Order saved = orderRepository.save(order);
        log.info("Website order accepted: {} by user {}", saved.getOrderNumber(), username);
        return OrderResponse.from(saved);
    }

    @Override
    @Transactional
    public OrderResponse rejectWebsiteOrder(Long orderId, String reason, String username) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Website order not found with id: " + orderId));

        if (order.getOrderSource() != OrderSource.WEBSITE) {
            throw new IllegalArgumentException("Order " + order.getOrderNumber() + " is not a website order");
        }

        if (order.getAcceptanceStatus() != AcceptanceStatus.PENDING) {
            throw new IllegalStateException("Website order is already " + order.getAcceptanceStatus());
        }

        order.setAcceptanceStatus(AcceptanceStatus.REJECTED);
        order.setStatus(OrderStatus.CANCELLED);
        order.getItems().forEach(item -> item.setStatus(OrderItemStatus.CANCELLED));
        order.recalculateTotal();

        String rejectionReason = (reason != null && !reason.isBlank()) ? reason.trim() : "Rejected by kitchen staff";
        String auditNote = "Rejected: " + rejectionReason + " (by " + (username != null ? username : "staff") + ")";
        order.setNotes(order.getNotes() != null ? order.getNotes() + " | " + auditNote : auditNote);

        Order saved = orderRepository.save(order);
        log.info("Website order rejected: {} (reason: {}) by user {}", saved.getOrderNumber(), rejectionReason, username);
        return OrderResponse.from(saved);
    }
}
