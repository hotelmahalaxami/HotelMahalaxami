package com.mahalaxmi.pos.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public record PublicOrderSubmissionRequest(
        @NotBlank(message = "Customer name is required")
        @Size(min = 2, max = 100, message = "Customer name must be between 2 and 100 characters")
        String customerName,

        @NotBlank(message = "Customer phone number is required")
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Please provide a valid 10-digit Indian mobile number")
        String customerPhone,

        @Size(max = 255, message = "Pickup notes cannot exceed 255 characters")
        String pickupNotes,

        @NotBlank(message = "Idempotency key is required")
        @Size(min = 16, max = 128, message = "Invalid idempotency key format")
        String idempotencyKey,

        @NotEmpty(message = "Order must contain at least one item")
        @Valid
        List<PublicOrderItemSubmissionRequest> items
) {}
