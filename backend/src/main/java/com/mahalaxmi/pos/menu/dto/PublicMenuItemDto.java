package com.mahalaxmi.pos.menu.dto;

import java.math.BigDecimal;

public record PublicMenuItemDto(
        Long id,
        Long categoryId,
        String categoryName,
        String name,
        BigDecimal price,
        boolean isVeg,
        boolean available,
        int displayOrder
) {}
