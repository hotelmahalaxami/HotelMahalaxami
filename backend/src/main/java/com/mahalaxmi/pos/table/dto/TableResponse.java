package com.mahalaxmi.pos.table.dto;

import com.mahalaxmi.pos.table.entity.RestaurantTable;
import java.time.LocalDateTime;

public record TableResponse(
        Long id,
        String tableName,
        int capacity,
        boolean active,
        int displayOrder,
        boolean isOccupied,
        Long currentOrderId,
        String currentOrderNumber,
        LocalDateTime occupiedSince,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static TableResponse of(RestaurantTable table, boolean isOccupied, Long currentOrderId, String currentOrderNumber, LocalDateTime occupiedSince) {
        return new TableResponse(
                table.getId(),
                table.getTableName(),
                table.getCapacity(),
                table.isActive(),
                table.getDisplayOrder(),
                isOccupied,
                currentOrderId,
                currentOrderNumber,
                occupiedSince,
                table.getCreatedAt(),
                table.getUpdatedAt()
        );
    }
}
