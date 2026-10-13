package com.mahalaxmi.pos.menu.dto;

import com.mahalaxmi.pos.menu.entity.MenuItem;
import java.math.BigDecimal;

public record MenuItemResponse(
        Long id,
        Long categoryId,
        String categoryName,
        String name,
        BigDecimal price,
        boolean isVeg,
        boolean available,
        int displayOrder
) {
    public static MenuItemResponse from(MenuItem item) {
        return new MenuItemResponse(
                item.getId(),
                item.getCategory().getId(),
                item.getCategory().getName(),
                item.getName(),
                item.getPrice(),
                item.isVeg(),
                item.isAvailable(),
                item.getDisplayOrder()
        );
    }
}
