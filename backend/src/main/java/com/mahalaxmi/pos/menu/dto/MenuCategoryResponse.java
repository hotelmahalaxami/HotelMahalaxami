package com.mahalaxmi.pos.menu.dto;

import com.mahalaxmi.pos.menu.entity.MenuCategory;

public record MenuCategoryResponse(
        Long id,
        String name,
        int displayOrder,
        boolean active
) {
    public static MenuCategoryResponse from(MenuCategory category) {
        return new MenuCategoryResponse(
                category.getId(),
                category.getName(),
                category.getDisplayOrder(),
                category.isActive()
        );
    }
}
