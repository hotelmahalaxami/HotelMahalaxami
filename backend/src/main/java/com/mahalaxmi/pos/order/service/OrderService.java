package com.mahalaxmi.pos.order.service;

import com.mahalaxmi.pos.order.dto.CreateOrderRequest;
import com.mahalaxmi.pos.order.dto.OrderResponse;
import com.mahalaxmi.pos.order.dto.UpdateOrderRequest;
import com.mahalaxmi.pos.order.entity.OrderStatus;

import java.util.List;

public interface OrderService {
    OrderResponse createOrder(CreateOrderRequest request, String username);
    OrderResponse getOrderById(Long id);
    OrderResponse getOrderByNumber(String orderNumber);
    List<OrderResponse> getOrders(OrderStatus status);
    List<OrderResponse> getRecentOrders(int limit);
    OrderResponse updateOrder(Long id, UpdateOrderRequest request);
    OrderResponse cancelOrderItem(Long orderId, Long orderItemId);
    OrderResponse cancelOrder(Long orderId);
}
