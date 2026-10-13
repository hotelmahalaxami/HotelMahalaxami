package com.mahalaxmi.pos.order.service;

import com.mahalaxmi.pos.common.exception.ResourceNotFoundException;
import com.mahalaxmi.pos.menu.entity.MenuItem;
import com.mahalaxmi.pos.menu.repository.MenuItemRepository;
import com.mahalaxmi.pos.order.dto.CreateOrderRequest;
import com.mahalaxmi.pos.order.dto.OrderItemRequest;
import com.mahalaxmi.pos.order.dto.OrderResponse;
import com.mahalaxmi.pos.order.dto.UpdateOrderRequest;
import com.mahalaxmi.pos.order.entity.*;
import com.mahalaxmi.pos.order.repository.OrderRepository;
import com.mahalaxmi.pos.user.entity.User;
import com.mahalaxmi.pos.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class OrderServiceImpl implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);
    private static final DateTimeFormatter ORDER_NUM_DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");

    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;

    public OrderServiceImpl(OrderRepository orderRepository,
                            MenuItemRepository menuItemRepository,
                            UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.menuItemRepository = menuItemRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, String username) {
        User creator = null;
        if (username != null) {
            creator = userRepository.findByUsername(username)
                    .or(() -> userRepository.findByEmail(username))
                    .orElse(null);
        }

        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setTableNumber(request.tableNumber() != null ? request.tableNumber().trim() : null);
        order.setOrderType(request.orderType() != null ? request.orderType() : OrderType.DINE_IN);
        order.setStatus(OrderStatus.OPEN);
        order.setNotes(request.notes() != null ? request.notes().trim() : null);
        order.setCreatedBy(creator);

        Map<Long, Integer> mergedQuantities = mergeItemQuantities(request.items());
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
        log.info("Order created: {} (total: {})", saved.getOrderNumber(), saved.getTotalAmount());
        return OrderResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return OrderResponse.from(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders(OrderStatus status) {
        return orderRepository.findOrdersWithItems(status)
                .stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public OrderResponse updateOrder(Long id, UpdateOrderRequest request) {
        Order order = orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot modify a cancelled order");
        }

        if (request.tableNumber() != null) {
            order.setTableNumber(request.tableNumber().trim());
        }
        if (request.orderType() != null) {
            order.setOrderType(request.orderType());
        }
        if (request.status() != null) {
            order.setStatus(request.status());
        }
        if (request.notes() != null) {
            order.setNotes(request.notes().trim());
        }

        // Replace active items with updated item list and recalculate server-side
        order.getItems().clear();
        Map<Long, Integer> mergedQuantities = mergeItemQuantities(request.items());
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
        log.info("Order updated: {} (total: {})", saved.getOrderNumber(), saved.getTotalAmount());
        return OrderResponse.from(saved);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrderItem(Long orderId, Long orderItemId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Order is already cancelled");
        }

        OrderItem target = order.getItems().stream()
                .filter(i -> Objects.equals(i.getId(), orderItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found with id: " + orderItemId));

        order.removeItem(target);

        boolean hasActiveItems = order.getItems().stream()
                .anyMatch(i -> i.getStatus() == OrderItemStatus.ACTIVE);
        if (!hasActiveItems) {
            order.setStatus(OrderStatus.CANCELLED);
        }

        Order saved = orderRepository.save(order);
        log.info("Removed item {} from order {} (new total: {})", orderItemId, saved.getOrderNumber(), saved.getTotalAmount());
        return OrderResponse.from(saved);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(Long orderId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setStatus(OrderStatus.CANCELLED);
        order.getItems().forEach(item -> item.setStatus(OrderItemStatus.CANCELLED));
        order.recalculateTotal();

        Order saved = orderRepository.save(order);
        log.info("Order cancelled: {}", saved.getOrderNumber());
        return OrderResponse.from(saved);
    }

    private Map<Long, Integer> mergeItemQuantities(List<OrderItemRequest> requests) {
        Map<Long, Integer> merged = new LinkedHashMap<>();
        for (OrderItemRequest req : requests) {
            merged.merge(req.menuItemId(), req.quantity(), Integer::sum);
        }
        return merged;
    }

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(ORDER_NUM_DATE_FMT);
        int randomSuffix = 100 + new Random().nextInt(900);
        return "ORD-" + timestamp + "-" + randomSuffix;
    }
}
