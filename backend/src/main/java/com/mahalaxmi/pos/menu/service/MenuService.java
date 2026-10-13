package com.mahalaxmi.pos.menu.service;

import com.mahalaxmi.pos.menu.dto.MenuCategoryResponse;
import com.mahalaxmi.pos.menu.dto.MenuItemResponse;

import java.util.List;

public interface MenuService {
    List<MenuCategoryResponse> getActiveCategories();
    List<MenuItemResponse> getAvailableItems(Long categoryId, String search);
}
