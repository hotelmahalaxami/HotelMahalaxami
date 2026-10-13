package com.mahalaxmi.pos.order.dto;

import com.mahalaxmi.pos.order.entity.OrderItem;
import com.mahalaxmi.pos.order.entity.OrderItemStatus;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long id,
        Long menuItemId,
        String itemName,
        BigDecimal unitPrice,
        int quantity,
        BigDecimal subtotal,
        OrderItemStatus status
) {
    public static OrderItemResponse from(OrderItem item) {
        return new OrderItemResponse(
                item.getId(),
                item.getMenuItem().getId(),
                item.getItemName(),
                item.getUnitPrice(),
                item.getQuantity(),
                item.getSubtotal(),
                item.getStatus()
        );
    }
}
