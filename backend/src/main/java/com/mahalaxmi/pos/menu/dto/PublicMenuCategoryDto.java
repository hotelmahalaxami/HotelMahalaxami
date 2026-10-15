package com.mahalaxmi.pos.menu.dto;

import java.util.List;

public record PublicMenuCategoryDto(
        Long id,
        String name,
        int displayOrder,
        List<PublicMenuItemDto> items
) {}
