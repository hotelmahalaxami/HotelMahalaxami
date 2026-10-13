package com.mahalaxmi.pos.order.dto;

import com.mahalaxmi.pos.order.entity.OrderStatus;
import com.mahalaxmi.pos.order.entity.OrderType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateOrderRequest(
        @Size(max = 30, message = "Table number must not exceed 30 characters")
        String tableNumber,

        OrderType orderType,

        OrderStatus status,

        @Size(max = 500, message = "Notes must not exceed 500 characters")
        String notes,

        @NotEmpty(message = "Order must contain at least one item")
        @Valid
        List<OrderItemRequest> items
) {}
