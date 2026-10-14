package com.mahalaxmi.pos.menu.controller;

import com.mahalaxmi.pos.common.response.ApiResponse;
import com.mahalaxmi.pos.menu.dto.*;
import com.mahalaxmi.pos.menu.service.MenuService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/menu")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    // --- Public / Staff endpoints ---

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<MenuCategoryResponse>>> getCategories() {
        List<MenuCategoryResponse> categories = menuService.getActiveCategories();
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    @GetMapping("/items")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getItems(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search
    ) {
        List<MenuItemResponse> items = menuService.getAvailableItems(categoryId, search);
        return ResponseEntity.ok(ApiResponse.ok(items));
    }

    // --- Admin Category Endpoints ---

    @GetMapping("/admin/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<MenuCategoryResponse>>> getAllCategoriesAdmin() {
        List<MenuCategoryResponse> categories = menuService.getAllCategoriesAdmin();
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MenuCategoryResponse>> createCategory(
            @Valid @RequestBody CreateCategoryRequest request
    ) {
        MenuCategoryResponse category = menuService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(category, "Category created successfully"));
    }

    @PutMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MenuCategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryRequest request
    ) {
        MenuCategoryResponse category = menuService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.ok(category, "Category updated successfully"));
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        menuService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.message("Category deleted/deactivated successfully"));
    }

    // --- Admin Menu Item Endpoints ---

    @GetMapping({"/admin/items", "/items/admin"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getAllItemsAdmin(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search
    ) {
        List<MenuItemResponse> items = menuService.getAllMenuItemsAdmin(categoryId, search);
        return ResponseEntity.ok(ApiResponse.ok(items));
    }

    @PostMapping("/items")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MenuItemResponse>> createItem(
            @Valid @RequestBody CreateMenuItemRequest request
    ) {
        MenuItemResponse item = menuService.createMenuItem(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(item, "Menu item created successfully"));
    }

    @PutMapping("/items/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MenuItemResponse>> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMenuItemRequest request
    ) {
        MenuItemResponse item = menuService.updateMenuItem(id, request);
        return ResponseEntity.ok(ApiResponse.ok(item, "Menu item updated successfully"));
    }

    @PatchMapping({"/items/{id}/availability", "/items/{id}/toggle-availability"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MenuItemResponse>> toggleAvailability(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean available
    ) {
        MenuItemResponse item = menuService.toggleItemAvailability(id, available);
        return ResponseEntity.ok(ApiResponse.ok(item, "Item availability updated"));
    }

    @DeleteMapping("/items/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteItem(@PathVariable Long id) {
        menuService.deleteMenuItem(id);
        return ResponseEntity.ok(ApiResponse.message("Menu item deleted/deactivated successfully"));
    }
}
