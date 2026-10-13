package com.mahalaxmi.pos.menu.service;

import com.mahalaxmi.pos.menu.dto.MenuCategoryResponse;
import com.mahalaxmi.pos.menu.dto.MenuItemResponse;
import com.mahalaxmi.pos.menu.repository.MenuCategoryRepository;
import com.mahalaxmi.pos.menu.repository.MenuItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class MenuServiceImpl implements MenuService {

    private final MenuCategoryRepository categoryRepository;
    private final MenuItemRepository itemRepository;

    public MenuServiceImpl(MenuCategoryRepository categoryRepository, MenuItemRepository itemRepository) {
        this.categoryRepository = categoryRepository;
        this.itemRepository = itemRepository;
    }

    @Override
    public List<MenuCategoryResponse> getActiveCategories() {
        return categoryRepository.findByActiveTrueOrderByDisplayOrderAscNameAsc()
                .stream()
                .map(MenuCategoryResponse::from)
                .toList();
    }

    @Override
    public List<MenuItemResponse> getAvailableItems(Long categoryId, String search) {
        String normalizedSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        return itemRepository.findAvailableItems(categoryId, normalizedSearch)
                .stream()
                .map(MenuItemResponse::from)
                .toList();
    }
}
