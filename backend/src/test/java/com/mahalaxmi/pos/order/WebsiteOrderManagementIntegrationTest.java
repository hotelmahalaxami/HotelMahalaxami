package com.mahalaxmi.pos.order;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mahalaxmi.pos.menu.entity.MenuCategory;
import com.mahalaxmi.pos.menu.entity.MenuItem;
import com.mahalaxmi.pos.menu.repository.MenuCategoryRepository;
import com.mahalaxmi.pos.menu.repository.MenuItemRepository;
import com.mahalaxmi.pos.order.dto.PublicOrderItemSubmissionRequest;
import com.mahalaxmi.pos.order.dto.PublicOrderSubmissionRequest;
import com.mahalaxmi.pos.order.dto.PublicOrderSubmissionResponse;
import com.mahalaxmi.pos.order.entity.AcceptanceStatus;
import com.mahalaxmi.pos.order.entity.Order;
import com.mahalaxmi.pos.order.entity.OrderStatus;
import com.mahalaxmi.pos.order.repository.OrderRepository;
import com.mahalaxmi.pos.order.service.OrderService;
import com.mahalaxmi.pos.order.service.PublicOrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
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
public class WebsiteOrderManagementIntegrationTest {

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

    @Autowired
    private PublicOrderService publicOrderService;

    @Autowired
    private OrderService orderService;

    private MenuItem testDish;

    @BeforeEach
    void setUp() {
        MenuCategory cat = categoryRepository.save(new MenuCategory("Feasts", 1, true));
        testDish = menuItemRepository.save(
                new MenuItem(cat, "Mutton Sukka Plate", new BigDecimal("290.00"), false, true, 1)
        );
    }

    private Order createPendingWebsiteOrder(String customerName, String phone) {
        PublicOrderSubmissionRequest request = new PublicOrderSubmissionRequest(
                customerName,
                phone,
                "Extra onions",
                UUID.randomUUID().toString(),
                List.of(new PublicOrderItemSubmissionRequest(testDish.getId(), 1, null))
        );
        PublicOrderSubmissionResponse res = publicOrderService.submitPublicOrder(request, "127.0.0.1");
        return orderRepository.findByTrackingToken(res.trackingToken()).orElseThrow();
    }

    @Test
    @WithMockUser(username = "staff1", roles = {"STAFF"})
    void getWebsiteOrders_ShouldReturnPendingOrders() throws Exception {
        createPendingWebsiteOrder("Ramesh G", "9811122233");

        mockMvc.perform(get("/api/v1/orders/website?status=PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].customerName").value("Ramesh G"))
                .andExpect(jsonPath("$.data[0].customerPhone").value("9811122233"))
                .andExpect(jsonPath("$.data[0].acceptanceStatus").value("PENDING"));

        mockMvc.perform(get("/api/v1/orders/website/pending-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.pendingCount").isNumber());
    }

    @Test
    @WithMockUser(username = "staff1", roles = {"STAFF"})
    void acceptWebsiteOrder_ShouldChangeAcceptanceStatusAndIncludeInGeneralOrders() throws Exception {
        Order pendingOrder = createPendingWebsiteOrder("Ajay Kadam", "9988776655");

        // Before acceptance, order should NOT be returned by regular POS getOrders
        assertThat(orderService.getOrders(OrderStatus.OPEN).stream()
                .anyMatch(o -> o.id().equals(pendingOrder.getId()))).isFalse();

        // Staff accepts website order
        mockMvc.perform(post("/api/v1/orders/website/{id}/accept", pendingOrder.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.acceptanceStatus").value("ACCEPTED"));

        // Verify entity updated
        Order updated = orderRepository.findById(pendingOrder.getId()).orElseThrow();
        assertThat(updated.getAcceptanceStatus()).isEqualTo(AcceptanceStatus.ACCEPTED);

        // Now order IS included in regular POS getOrders!
        assertThat(orderService.getOrders(OrderStatus.OPEN).stream()
                .anyMatch(o -> o.id().equals(pendingOrder.getId()))).isTrue();
    }

    @Test
    @WithMockUser(username = "staff1", roles = {"STAFF"})
    void rejectWebsiteOrder_ShouldCancelOrderAndItems() throws Exception {
        Order pendingOrder = createPendingWebsiteOrder("Sunil More", "9876501234");

        Map<String, String> body = Map.of("reason", "Kitchen closing for the afternoon");
        mockMvc.perform(post("/api/v1/orders/website/{id}/reject", pendingOrder.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.acceptanceStatus").value("REJECTED"))
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));

        Order cancelled = orderRepository.findById(pendingOrder.getId()).orElseThrow();
        assertThat(cancelled.getAcceptanceStatus()).isEqualTo(AcceptanceStatus.REJECTED);
        assertThat(cancelled.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(cancelled.getNotes()).contains("Kitchen closing for the afternoon");
    }

    @Test
    void websiteOrdersEndpoint_RequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/orders/website"))
                .andExpect(status().isUnauthorized());
    }
}
