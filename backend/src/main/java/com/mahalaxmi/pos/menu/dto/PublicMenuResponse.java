package com.mahalaxmi.pos.menu.dto;

import java.util.List;

public record PublicMenuResponse(
        List<PublicMenuCategoryDto> categories
) {}
