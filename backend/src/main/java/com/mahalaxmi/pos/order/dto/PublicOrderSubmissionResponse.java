package com.mahalaxmi.pos.order.dto;

import com.mahalaxmi.pos.order.entity.AcceptanceStatus;
import com.mahalaxmi.pos.order.entity.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PublicOrderSubmissionResponse(
        String orderNumber,
        String trackingToken,
        OrderStatus status,
        AcceptanceStatus acceptanceStatus,
        BigDecimal totalAmount,
        int estimatedPickupMinutes,
        String message,
        LocalDateTime createdAt
) {}
