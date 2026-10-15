package com.mahalaxmi.pos.menu.service;

import com.mahalaxmi.pos.menu.dto.*;

import java.util.List;

public interface MenuService {
    // Public/Staff
    List<MenuCategoryResponse> getActiveCategories();
    List<MenuItemResponse> getAvailableItems(Long categoryId, String search);
    PublicMenuResponse getPublicMenu();

    // Admin Category Management
    List<MenuCategoryResponse> getAllCategoriesAdmin();
    MenuCategoryResponse createCategory(CreateCategoryRequest request);
    MenuCategoryResponse updateCategory(Long id, UpdateCategoryRequest request);
    void deleteCategory(Long id);

    // Admin Menu Item Management
    List<MenuItemResponse> getAllMenuItemsAdmin(Long categoryId, String search);
    MenuItemResponse createMenuItem(CreateMenuItemRequest request);
    MenuItemResponse updateMenuItem(Long id, UpdateMenuItemRequest request);
    MenuItemResponse toggleItemAvailability(Long id, Boolean available);
    void deleteMenuItem(Long id);
}
