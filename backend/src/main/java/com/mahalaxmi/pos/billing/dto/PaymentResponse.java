package com.mahalaxmi.pos.billing.dto;

import com.mahalaxmi.pos.billing.entity.Payment;
import com.mahalaxmi.pos.billing.entity.PaymentMethod;
import com.mahalaxmi.pos.billing.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
        Long id,
        String paymentNumber,
        BigDecimal amount,
        PaymentMethod paymentMethod,
        String transactionRef,
        PaymentStatus status,
        String recordedByUsername,
        LocalDateTime createdAt
) {
    public static PaymentResponse from(Payment payment) {
        if (payment == null) return null;
        return new PaymentResponse(
                payment.getId(),
                payment.getPaymentNumber(),
                payment.getAmount(),
                payment.getPaymentMethod(),
                payment.getTransactionRef(),
                payment.getStatus(),
                payment.getRecordedBy() != null ? payment.getRecordedBy().getUsername() : null,
                payment.getCreatedAt()
        );
    }
}
