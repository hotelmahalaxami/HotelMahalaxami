package com.mahalaxmi.pos.menu.service;

import com.mahalaxmi.pos.common.exception.DuplicateResourceException;
import com.mahalaxmi.pos.common.exception.ResourceNotFoundException;
import com.mahalaxmi.pos.menu.dto.*;
import com.mahalaxmi.pos.menu.entity.MenuCategory;
import com.mahalaxmi.pos.menu.entity.MenuItem;
import com.mahalaxmi.pos.menu.repository.MenuCategoryRepository;
import com.mahalaxmi.pos.menu.repository.MenuItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.RoundingMode;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class MenuServiceImpl implements MenuService {

    private static final Logger log = LoggerFactory.getLogger(MenuServiceImpl.class);

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

        List<MenuItem> items;
        if (categoryId != null && normalizedSearch != null) {
            items = itemRepository.findAvailableByCategoryAndSearch(categoryId, normalizedSearch);
        } else if (categoryId != null) {
            items = itemRepository.findAvailableByCategory(categoryId);
        } else if (normalizedSearch != null) {
            items = itemRepository.findAvailableBySearch(normalizedSearch);
        } else {
            items = itemRepository.findAllAvailable();
        }

        return items.stream()
                .map(MenuItemResponse::from)
                .toList();
    }

    // --- Admin Category Management ---

    @Override
    public List<MenuCategoryResponse> getAllCategoriesAdmin() {
        return categoryRepository.findAllByOrderByDisplayOrderAscNameAsc()
                .stream()
                .map(MenuCategoryResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public MenuCategoryResponse createCategory(CreateCategoryRequest request) {
        String name = request.name().trim();
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException("Category already exists with name: " + name);
        }

        int displayOrder = (request.displayOrder() != null) ? request.displayOrder() : 0;
        MenuCategory category = new MenuCategory(name, displayOrder, true);
        MenuCategory saved = categoryRepository.save(category);
        log.info("Created menu category: {} (ID: {})", saved.getName(), saved.getId());
        return MenuCategoryResponse.from(saved);
    }

    @Override
    @Transactional
    public MenuCategoryResponse updateCategory(Long id, UpdateCategoryRequest request) {
        MenuCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        String newName = request.name().trim();
        if (!category.getName().equalsIgnoreCase(newName) && categoryRepository.existsByNameIgnoreCase(newName)) {
            throw new DuplicateResourceException("Category already exists with name: " + newName);
        }

        category.setName(newName);
        if (request.displayOrder() != null) {
            category.setDisplayOrder(request.displayOrder());
        }
        if (request.active() != null) {
            category.setActive(request.active());
        }

        MenuCategory saved = categoryRepository.save(category);
        log.info("Updated menu category: {} (ID: {})", saved.getName(), saved.getId());
        return MenuCategoryResponse.from(saved);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        MenuCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        try {
            categoryRepository.delete(category);
            log.info("Deleted menu category: {} (ID: {})", category.getName(), id);
        } catch (DataIntegrityViolationException ex) {
            // If items reference this category, soft delete / deactivate it instead of breaking referential integrity
            category.setActive(false);
            categoryRepository.save(category);
            log.info("Deactivated menu category due to existing items: {} (ID: {})", category.getName(), id);
        }
    }

    // --- Admin Menu Item Management ---

    @Override
    public List<MenuItemResponse> getAllMenuItemsAdmin(Long categoryId, String search) {
        String normalizedSearch = (search != null && !search.isBlank()) ? search.trim() : null;

        List<MenuItem> items;
        if (categoryId != null && normalizedSearch != null) {
            items = itemRepository.findByCategoryAndSearchAdmin(categoryId, normalizedSearch);
        } else if (categoryId != null) {
            items = itemRepository.findByCategoryAdmin(categoryId);
        } else if (normalizedSearch != null) {
            items = itemRepository.findBySearchAdmin(normalizedSearch);
        } else {
            items = itemRepository.findAllAdmin();
        }

        return items.stream()
                .map(MenuItemResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public MenuItemResponse createMenuItem(CreateMenuItemRequest request) {
        MenuCategory category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.categoryId()));

        String name = request.name().trim();
        if (itemRepository.existsByCategoryIdAndNameIgnoreCase(category.getId(), name)) {
            throw new DuplicateResourceException("Item '" + name + "' already exists in category '" + category.getName() + "'");
        }

        MenuItem item = new MenuItem(
                category,
                name,
                request.price().setScale(2, RoundingMode.HALF_UP),
                request.isVeg() == null || request.isVeg(),
                request.available() == null || request.available(),
                request.displayOrder() != null ? request.displayOrder() : 0
        );

        MenuItem saved = itemRepository.save(item);
        log.info("Created menu item: {} (₹{}) in category: {}", saved.getName(), saved.getPrice(), category.getName());
        return MenuItemResponse.from(saved);
    }

    @Override
    @Transactional
    public MenuItemResponse updateMenuItem(Long id, UpdateMenuItemRequest request) {
        MenuItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));

        if (request.categoryId() != null && !request.categoryId().equals(item.getCategory().getId())) {
            MenuCategory newCategory = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.categoryId()));
            item.setCategory(newCategory);
        }

        String newName = request.name().trim();
        if (!item.getName().equalsIgnoreCase(newName) &&
                itemRepository.existsByCategoryIdAndNameIgnoreCase(item.getCategory().getId(), newName)) {
            throw new DuplicateResourceException("Item '" + newName + "' already exists in category '" + item.getCategory().getName() + "'");
        }

        item.setName(newName);
        item.setPrice(request.price().setScale(2, RoundingMode.HALF_UP));
        if (request.isVeg() != null) {
            item.setVeg(request.isVeg());
        }
        if (request.available() != null) {
            item.setAvailable(request.available());
        }
        if (request.displayOrder() != null) {
            item.setDisplayOrder(request.displayOrder());
        }

        MenuItem saved = itemRepository.save(item);
        log.info("Updated menu item: {} - New Price: ₹{}, Available: {}", saved.getName(), saved.getPrice(), saved.isAvailable());
        return MenuItemResponse.from(saved);
    }

    @Override
    @Transactional
    public MenuItemResponse toggleItemAvailability(Long id, Boolean available) {
        MenuItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));

        boolean newStatus = (available != null) ? available : !item.isAvailable();
        item.setAvailable(newStatus);

        MenuItem saved = itemRepository.save(item);
        log.info("Toggled menu item availability: {} -> {}", saved.getName(), saved.isAvailable());
        return MenuItemResponse.from(saved);
    }

    @Override
    @Transactional
    public void deleteMenuItem(Long id) {
        MenuItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));

        try {
            itemRepository.delete(item);
            log.info("Deleted menu item: {} (ID: {})", item.getName(), id);
        } catch (DataIntegrityViolationException ex) {
            // Item is part of historical order_items, so soft-deactivate instead of deleting
            item.setAvailable(false);
            itemRepository.save(item);
            log.info("Deactivated menu item due to order history: {} (ID: {})", item.getName(), id);
        }
    }
}
