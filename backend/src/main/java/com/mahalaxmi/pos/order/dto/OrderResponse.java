package com.mahalaxmi.pos.order.dto;

import com.mahalaxmi.pos.order.entity.AcceptanceStatus;
import com.mahalaxmi.pos.order.entity.Order;
import com.mahalaxmi.pos.order.entity.OrderSource;
import com.mahalaxmi.pos.order.entity.OrderStatus;
import com.mahalaxmi.pos.order.entity.OrderType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderNumber,
        String tableNumber,
        OrderType orderType,
        OrderStatus status,
        BigDecimal totalAmount,
        String notes,
        String createdByUsername,
        List<OrderItemResponse> items,
        OrderSource orderSource,
        AcceptanceStatus acceptanceStatus,
        String customerName,
        String customerPhone,
        String pickupNotes,
        String trackingToken,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static OrderResponse from(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(OrderItemResponse::from)
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getTableNumber(),
                order.getOrderType(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getNotes(),
                order.getCreatedBy() != null ? order.getCreatedBy().getUsername() : null,
                itemResponses,
                order.getOrderSource(),
                order.getAcceptanceStatus(),
                order.getCustomerName(),
                order.getCustomerPhone(),
                order.getPickupNotes(),
                order.getTrackingToken(),
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}
