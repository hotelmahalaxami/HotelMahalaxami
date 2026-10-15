package com.mahalaxmi.pos.order;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mahalaxmi.pos.menu.entity.MenuCategory;
import com.mahalaxmi.pos.menu.entity.MenuItem;
import com.mahalaxmi.pos.menu.repository.MenuCategoryRepository;
import com.mahalaxmi.pos.menu.repository.MenuItemRepository;
import com.mahalaxmi.pos.order.dto.PublicOrderItemSubmissionRequest;
import com.mahalaxmi.pos.order.dto.PublicOrderSubmissionRequest;
import com.mahalaxmi.pos.order.entity.AcceptanceStatus;
import com.mahalaxmi.pos.order.entity.Order;
import com.mahalaxmi.pos.order.entity.OrderSource;
import com.mahalaxmi.pos.order.entity.OrderType;
import com.mahalaxmi.pos.order.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class PublicOrderSubmissionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MenuCategoryRepository categoryRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    private MenuItem testVegThali;
    private MenuItem testChickenSukka;
    private MenuItem testUnavailableDish;

    @BeforeEach
    void setUp() {
        MenuCategory cat = categoryRepository.save(new MenuCategory("Special Feasts", 1, true));

        testVegThali = menuItemRepository.save(
                new MenuItem(cat, "Public Special Veg Thali", new BigDecimal("170.00"), true, true, 1)
        );
        testChickenSukka = menuItemRepository.save(
                new MenuItem(cat, "Public Chicken Sukka", new BigDecimal("210.00"), false, true, 2)
        );
        testUnavailableDish = menuItemRepository.save(
                new MenuItem(cat, "Public Sold Out Mutton", new BigDecimal("280.00"), false, false, 3)
        );
    }

    @Test
    void submitPublicOrder_ShouldSucceedAndCreatePendingWebsiteOrder() throws Exception {
        String idempotencyKey = UUID.randomUUID().toString();
        PublicOrderSubmissionRequest request = new PublicOrderSubmissionRequest(
                "Rohan Patil",
                "9876543210",
                "Extra spicy rassa please",
                idempotencyKey,
                List.of(
                        new PublicOrderItemSubmissionRequest(testVegThali.getId(), 2, null),
                        new PublicOrderItemSubmissionRequest(testChickenSukka.getId(), 1, null)
                )
        );

        MvcResult result = mockMvc.perform(post("/api/v1/public/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.orderNumber").exists())
                .andExpect(jsonPath("$.data.trackingToken").isNotEmpty())
                .andExpect(jsonPath("$.data.totalAmount").value(550.00)) // (2 * 170) + (1 * 210) = 550
                .andExpect(jsonPath("$.data.status").value("OPEN"))
                .andExpect(jsonPath("$.data.acceptanceStatus").value("PENDING"))
                .andReturn();

        String responseJson = result.getResponse().getContentAsString();
        String trackingToken = objectMapper.readTree(responseJson).path("data").path("trackingToken").asText();

        // Verify order persisted in database correctly
        Order savedOrder = orderRepository.findByTrackingToken(trackingToken).orElseThrow();
        assertThat(savedOrder.getOrderSource()).isEqualTo(OrderSource.WEBSITE);
        assertThat(savedOrder.getOrderType()).isEqualTo(OrderType.PARCEL);
        assertThat(savedOrder.getAcceptanceStatus()).isEqualTo(AcceptanceStatus.PENDING);
        assertThat(savedOrder.getTableNumber()).isNull();
        assertThat(savedOrder.getCustomerName()).isEqualTo("Rohan Patil");
        assertThat(savedOrder.getCustomerPhone()).isEqualTo("9876543210");
        assertThat(savedOrder.getPickupNotes()).isEqualTo("Extra spicy rassa please");
        assertThat(savedOrder.getItems()).hasSize(2);
    }

    @Test
    void submitPublicOrder_IdempotencyReturnsCachedResponseWithoutDuplicateOrder() throws Exception {
        String idempotencyKey = "unique-key-" + UUID.randomUUID();
        PublicOrderSubmissionRequest request = new PublicOrderSubmissionRequest(
                "Anita Desai",
                "9123456789",
                "Pack spoons",
                idempotencyKey,
                List.of(new PublicOrderItemSubmissionRequest(testVegThali.getId(), 1, null))
        );

        long orderCountBefore = orderRepository.count();

        // First call
        mockMvc.perform(post("/api/v1/public/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.totalAmount").value(170.00));

        long orderCountAfterFirst = orderRepository.count();
        assertThat(orderCountAfterFirst).isEqualTo(orderCountBefore + 1);

        // Second call with same idempotency key
        mockMvc.perform(post("/api/v1/public/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.totalAmount").value(170.00));

        long orderCountAfterSecond = orderRepository.count();
        assertThat(orderCountAfterSecond).isEqualTo(orderCountAfterFirst); // No duplicate order created!
    }

    @Test
    void submitPublicOrder_RejectsUnavailableMenuItem() throws Exception {
        PublicOrderSubmissionRequest request = new PublicOrderSubmissionRequest(
                "Suresh More",
                "9988776655",
                null,
                UUID.randomUUID().toString(),
                List.of(new PublicOrderItemSubmissionRequest(testUnavailableDish.getId(), 1, null))
        );

        mockMvc.perform(post("/api/v1/public/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("currently unavailable")));
    }

    @Test
    void trackPublicOrder_ShouldReturnOrderDetailsByUnguessableToken() throws Exception {
        String idempotencyKey = UUID.randomUUID().toString();
        PublicOrderSubmissionRequest request = new PublicOrderSubmissionRequest(
                "Pooja Shinde",
                "9822001122",
                "Less oil in curry",
                idempotencyKey,
                List.of(new PublicOrderItemSubmissionRequest(testChickenSukka.getId(), 2, null))
        );

        MvcResult createResult = mockMvc.perform(post("/api/v1/public/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        String token = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .path("data").path("trackingToken").asText();

        // Track order using token
        mockMvc.perform(get("/api/v1/public/orders/track/{trackingToken}", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.orderNumber").exists())
                .andExpect(jsonPath("$.data.status").value("OPEN"))
                .andExpect(jsonPath("$.data.acceptanceStatus").value("PENDING"))
                .andExpect(jsonPath("$.data.totalAmount").value(420.00))
                .andExpect(jsonPath("$.data.pickupNotes").value("Less oil in curry"))
                .andExpect(jsonPath("$.data.items[0].itemName").value("Public Chicken Sukka"))
                .andExpect(jsonPath("$.data.items[0].quantity").value(2));
    }

    @Test
    void trackPublicOrder_ShouldReturn404ForUnknownToken() throws Exception {
        mockMvc.perform(get("/api/v1/public/orders/track/{trackingToken}", "non-existent-token-12345"))
                .andExpect(status().isNotFound());
    }
}
