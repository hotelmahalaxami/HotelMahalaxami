package com.mahalaxmi.pos.order.dto;

import com.mahalaxmi.pos.order.entity.AcceptanceStatus;
import com.mahalaxmi.pos.order.entity.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PublicOrderTrackingResponse(
        String orderNumber,
        OrderStatus status,
        AcceptanceStatus acceptanceStatus,
        BigDecimal totalAmount,
        String pickupNotes,
        List<PublicOrderItemDetail> items,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public record PublicOrderItemDetail(
            String itemName,
            int quantity,
            BigDecimal unitPrice,
            BigDecimal subtotal
    ) {}
}
