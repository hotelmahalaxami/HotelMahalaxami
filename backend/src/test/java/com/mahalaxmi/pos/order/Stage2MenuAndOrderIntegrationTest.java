package com.mahalaxmi.pos.order;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mahalaxmi.pos.auth.dto.LoginRequest;
import com.mahalaxmi.pos.auth.dto.LoginResponse;
import com.mahalaxmi.pos.common.response.ApiResponse;
import com.mahalaxmi.pos.menu.entity.MenuCategory;
import com.mahalaxmi.pos.menu.entity.MenuItem;
import com.mahalaxmi.pos.menu.repository.MenuCategoryRepository;
import com.mahalaxmi.pos.menu.repository.MenuItemRepository;
import com.mahalaxmi.pos.order.dto.CreateOrderRequest;
import com.mahalaxmi.pos.order.dto.OrderItemRequest;
import com.mahalaxmi.pos.order.dto.UpdateOrderRequest;
import com.mahalaxmi.pos.order.entity.OrderStatus;
import com.mahalaxmi.pos.order.entity.OrderType;
import com.mahalaxmi.pos.order.repository.OrderRepository;
import com.mahalaxmi.pos.user.entity.Role;
import com.mahalaxmi.pos.user.entity.User;
import com.mahalaxmi.pos.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class Stage2MenuAndOrderIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MenuCategoryRepository categoryRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String authToken;
    private MenuItem specialVegThali;
    private MenuItem specialMahalaxmiThali;
    private MenuItem chickenFry;

    @BeforeEach
    void setUp() throws Exception {
        orderRepository.deleteAll();
        menuItemRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        User staffUser = new User("staff1", "staff1@mahalaxmi.com", passwordEncoder.encode("password123"), Role.STAFF, true);
        userRepository.save(staffUser);

        MenuCategory thaliCat = categoryRepository.save(new MenuCategory("Thali", 1, true));
        MenuCategory chickenCat = categoryRepository.save(new MenuCategory("Chicken", 2, true));

        specialMahalaxmiThali = menuItemRepository.save(
                new MenuItem(thaliCat, "Special Mahalaxmi Thali", new BigDecimal("350.00"), false, true, 1)
        );
        specialVegThali = menuItemRepository.save(
                new MenuItem(thaliCat, "Special Veg Thali", new BigDecimal("170.00"), true, true, 2)
        );
        chickenFry = menuItemRepository.save(
                new MenuItem(chickenCat, "Chicken Fry", new BigDecimal("200.00"), false, true, 1)
        );

        // Obtain JWT token
        LoginRequest loginRequest = new LoginRequest("staff1", "password123");
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String json = result.getResponse().getContentAsString();
        ApiResponse<LoginResponse> apiResponse = objectMapper.readValue(
                json,
                objectMapper.getTypeFactory().constructParametricType(ApiResponse.class, LoginResponse.class)
        );
        authToken = apiResponse.data().accessToken();
    }

    @AfterEach
    void tearDown() {
        orderRepository.deleteAll();
        menuItemRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void getCategoriesAndItems_returnsSeededMenu() throws Exception {
        mockMvc.perform(get("/api/v1/menu/categories")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].name").value("Thali"))
                .andExpect(jsonPath("$.data[1].name").value("Chicken"));

        mockMvc.perform(get("/api/v1/menu/items")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(3)));
    }

    @Test
    void simulateCustomerOrder_2VegThalisAnd1ChickenFry_totals540() throws Exception {
        // Simulate exact Stage 2 requirement:
        // Customer orders 2 Special Veg Thalis (2 x 170 = 340) + 1 Chicken Fry (1 x 200 = 200) => Total = 540.00
        CreateOrderRequest createReq = new CreateOrderRequest(
                "Table 4",
                OrderType.DINE_IN,
                "Less spicy chicken fry",
                List.of(
                        new OrderItemRequest(specialVegThali.getId(), 2),
                        new OrderItemRequest(chickenFry.getId(), 1)
                )
        );

        MvcResult createResult = mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.tableNumber").value("Table 4"))
                .andExpect(jsonPath("$.data.status").value("OPEN"))
                .andExpect(jsonPath("$.data.totalAmount").value(540.00))
                .andExpect(jsonPath("$.data.items", hasSize(2)))
                .andExpect(jsonPath("$.data.items[0].itemName").value("Special Veg Thali"))
                .andExpect(jsonPath("$.data.items[0].quantity").value(2))
                .andExpect(jsonPath("$.data.items[0].subtotal").value(340.00))
                .andExpect(jsonPath("$.data.items[1].itemName").value("Chicken Fry"))
                .andExpect(jsonPath("$.data.items[1].quantity").value(1))
                .andExpect(jsonPath("$.data.items[1].subtotal").value(200.00))
                .andReturn();

        // Extract orderId and itemId
        String body = createResult.getResponse().getContentAsString();
        Long orderId = ((Number) com.jayway.jsonpath.JsonPath.read(body, "$.data.id")).longValue();
        Long chickenFryOrderItemId = ((Number) com.jayway.jsonpath.JsonPath.read(body, "$.data.items[1].id")).longValue();

        // Verify GET /api/v1/orders/{id}
        mockMvc.perform(get("/api/v1/orders/" + orderId)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalAmount").value(540.00));

        // Verify UPDATE order: add 1 Special Mahalaxmi Thali (350) -> 340 + 200 + 350 = 890.00
        UpdateOrderRequest updateReq = new UpdateOrderRequest(
                "Table 4",
                OrderType.DINE_IN,
                OrderStatus.OPEN,
                "Added Special Mahalaxmi Thali",
                List.of(
                        new OrderItemRequest(specialVegThali.getId(), 2),
                        new OrderItemRequest(chickenFry.getId(), 1),
                        new OrderItemRequest(specialMahalaxmiThali.getId(), 1)
                )
        );

        MvcResult updateResult = mockMvc.perform(put("/api/v1/orders/" + orderId)
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalAmount").value(890.00))
                .andExpect(jsonPath("$.data.items", hasSize(3)))
                .andReturn();

        // Remove the Mahalaxmi Thali item via DELETE /api/v1/orders/{orderId}/items/{itemId}
        String updateBody = updateResult.getResponse().getContentAsString();
        Long mahalaxmiThaliOrderItemId = ((Number) com.jayway.jsonpath.JsonPath.read(updateBody, "$.data.items[2].id")).longValue();

        mockMvc.perform(delete("/api/v1/orders/" + orderId + "/items/" + mahalaxmiThaliOrderItemId)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalAmount").value(540.00))
                .andExpect(jsonPath("$.data.items", hasSize(2)));
    }
}
