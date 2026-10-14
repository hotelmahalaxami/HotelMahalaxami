package com.mahalaxmi.pos.menu.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record UpdateMenuItemRequest(
        Long categoryId,

        @NotBlank(message = "Item name is required")
        @Size(max = 150, message = "Item name must not exceed 150 characters")
        String name,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.00", message = "Price cannot be negative")
        BigDecimal price,

        Boolean isVeg,

        Boolean available,

        Integer displayOrder
) {
}
