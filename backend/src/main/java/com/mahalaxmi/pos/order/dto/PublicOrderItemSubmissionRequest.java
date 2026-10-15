package com.mahalaxmi.pos.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record PublicOrderItemSubmissionRequest(
        @NotNull(message = "Menu item ID is required")
        Long menuItemId,

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        Integer quantity,

        String notes
) {}
