package com.mahalaxmi.pos.order.controller;

import com.mahalaxmi.pos.common.response.ApiResponse;
import com.mahalaxmi.pos.order.dto.CreateOrderRequest;
import com.mahalaxmi.pos.order.dto.OrderResponse;
import com.mahalaxmi.pos.order.dto.UpdateOrderRequest;
import com.mahalaxmi.pos.order.entity.OrderStatus;
import com.mahalaxmi.pos.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null) ? auth.getName() : null;
        OrderResponse response = orderService.createOrder(request, username);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Order created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrders(
            @RequestParam(required = false) OrderStatus status
    ) {
        List<OrderResponse> orders = orderService.getOrders(status);
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long id) {
        OrderResponse order = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.ok(order));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrder(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderRequest request
    ) {
        OrderResponse updated = orderService.updateOrder(id, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Order updated successfully"));
    }

    @DeleteMapping("/{orderId}/items/{itemId}")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrderItem(
            @PathVariable Long orderId,
            @PathVariable Long itemId
    ) {
        OrderResponse updated = orderService.cancelOrderItem(orderId, itemId);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Item removed from order"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable Long id) {
        OrderResponse cancelled = orderService.cancelOrder(id);
        return ResponseEntity.ok(ApiResponse.ok(cancelled, "Order cancelled"));
    }
}
