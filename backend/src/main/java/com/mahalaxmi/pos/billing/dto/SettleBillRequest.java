package com.mahalaxmi.pos.billing.dto;

import com.mahalaxmi.pos.billing.entity.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record SettleBillRequest(
        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod,

        @DecimalMin(value = "0.01", message = "Payment amount must be greater than zero")
        BigDecimal amount,

        String transactionRef,

        String notes
) {
}
