package com.mahalaxmi.pos.menu;

import com.mahalaxmi.pos.menu.entity.MenuCategory;
import com.mahalaxmi.pos.menu.entity.MenuItem;
import com.mahalaxmi.pos.menu.repository.MenuCategoryRepository;
import com.mahalaxmi.pos.menu.repository.MenuItemRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PublicMenuIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MenuCategoryRepository categoryRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    private MenuCategory thaliCategory;
    private MenuItem mahalaxmiThali;
    private MenuItem hiddenItem;

    @BeforeEach
    void setUp() {
        menuItemRepository.deleteAll();
        categoryRepository.deleteAll();

        thaliCategory = new MenuCategory("Special Thalis", 1);
        thaliCategory.setActive(true);
        categoryRepository.save(thaliCategory);

        mahalaxmiThali = new MenuItem(
                thaliCategory,
                "Special Mahalaxmi Thali",
                new BigDecimal("350.00"),
                false,
                true,
                1
        );
        menuItemRepository.save(mahalaxmiThali);

        hiddenItem = new MenuItem(
                thaliCategory,
                "Sold-out Dish",
                new BigDecimal("200.00"),
                true,
                false,
                2
        );
        menuItemRepository.save(hiddenItem);
    }

    @AfterEach
    void tearDown() {
        menuItemRepository.deleteAll();
        categoryRepository.deleteAll();
    }

    @Test
    void getPublicMenu_returns200WithoutAuth_andContainsOnlyAvailableItems() throws Exception {
        mockMvc.perform(get("/api/v1/public/menu")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", containsString("max-age=60")))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.categories", hasSize(1)))
                .andExpect(jsonPath("$.data.categories[0].name").value("Special Thalis"))
                .andExpect(jsonPath("$.data.categories[0].items", hasSize(1)))
                .andExpect(jsonPath("$.data.categories[0].items[0].name").value("Special Mahalaxmi Thali"))
                .andExpect(jsonPath("$.data.categories[0].items[0].price").value(350.00))
                .andExpect(jsonPath("$.data.categories[0].items[0].available").value(true));
    }

    @Test
    void getPublicCategories_returns200WithoutAuth() throws Exception {
        mockMvc.perform(get("/api/v1/public/menu/categories")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].name").value("Special Thalis"));
    }

    @Test
    void getPublicItems_withSearchAndFilter_returnsMatchingAvailableItems() throws Exception {
        mockMvc.perform(get("/api/v1/public/menu/items")
                        .param("categoryId", thaliCategory.getId().toString())
                        .param("search", "Mahalaxmi")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].name").value("Special Mahalaxmi Thali"));
    }

    @Test
    void internalAdminMenuAndOrderEndpoints_stillRequireAuthentication() throws Exception {
        // Internal admin category list must be blocked without JWT
        mockMvc.perform(get("/api/v1/menu/admin/categories"))
                .andExpect(status().isUnauthorized());

        // Internal orders list must be blocked without JWT
        mockMvc.perform(get("/api/v1/orders"))
                .andExpect(status().isUnauthorized());
    }
}
