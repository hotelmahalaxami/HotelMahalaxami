package com.mahalaxmi.pos.billing.dto;

import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

public record GenerateBillRequest(
        @DecimalMin(value = "0.00", message = "Discount cannot be negative")
        BigDecimal discountAmount,

        @DecimalMin(value = "0.00", message = "Tax cannot be negative")
        BigDecimal taxAmount,

        String notes
) {
}
