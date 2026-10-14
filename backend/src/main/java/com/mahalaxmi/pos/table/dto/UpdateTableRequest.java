package com.mahalaxmi.pos.table.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateTableRequest(
        @NotBlank(message = "Table name is required")
        @Size(max = 50, message = "Table name cannot exceed 50 characters")
        String tableName,

        @Min(value = 1, message = "Capacity must be at least 1")
        Integer capacity,

        Boolean active,

        Integer displayOrder
) {
}
