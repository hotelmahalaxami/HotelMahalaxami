package com.mahalaxmi.pos.menu.controller;

import com.mahalaxmi.pos.common.response.ApiResponse;
import com.mahalaxmi.pos.menu.dto.MenuCategoryResponse;
import com.mahalaxmi.pos.menu.dto.MenuItemResponse;
import com.mahalaxmi.pos.menu.dto.PublicMenuResponse;
import com.mahalaxmi.pos.menu.service.MenuService;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/v1/public/menu")
public class PublicMenuController {

    private final MenuService menuService;

    public PublicMenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PublicMenuResponse>> getPublicMenu() {
        PublicMenuResponse menu = menuService.getPublicMenu();
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(60, TimeUnit.SECONDS).cachePublic())
                .body(ApiResponse.ok(menu));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<MenuCategoryResponse>>> getCategories() {
        List<MenuCategoryResponse> categories = menuService.getActiveCategories();
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(60, TimeUnit.SECONDS).cachePublic())
                .body(ApiResponse.ok(categories));
    }

    @GetMapping("/items")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getItems(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search
    ) {
        List<MenuItemResponse> items = menuService.getAvailableItems(categoryId, search);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(60, TimeUnit.SECONDS).cachePublic())
                .body(ApiResponse.ok(items));
    }
}
