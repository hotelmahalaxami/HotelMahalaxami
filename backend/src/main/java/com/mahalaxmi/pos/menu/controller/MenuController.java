package com.mahalaxmi.pos.menu.controller;

import com.mahalaxmi.pos.common.response.ApiResponse;
import com.mahalaxmi.pos.menu.dto.MenuCategoryResponse;
import com.mahalaxmi.pos.menu.dto.MenuItemResponse;
import com.mahalaxmi.pos.menu.service.MenuService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/menu")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

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
}
