package com.mahalaxmi.pos.billing;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mahalaxmi.pos.billing.dto.GenerateBillRequest;
import com.mahalaxmi.pos.billing.dto.SettleBillRequest;
import com.mahalaxmi.pos.billing.entity.BillStatus;
import com.mahalaxmi.pos.billing.entity.PaymentMethod;
import com.mahalaxmi.pos.billing.repository.BillRepository;
import com.mahalaxmi.pos.billing.repository.PaymentRepository;
import com.mahalaxmi.pos.menu.entity.MenuCategory;
import com.mahalaxmi.pos.menu.entity.MenuItem;
import com.mahalaxmi.pos.menu.repository.MenuCategoryRepository;
import com.mahalaxmi.pos.menu.repository.MenuItemRepository;
import com.mahalaxmi.pos.order.dto.CreateOrderRequest;
import com.mahalaxmi.pos.order.dto.OrderItemRequest;
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
import org.springframework.security.test.context.support.WithMockUser;
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
class Stage3BillingIntegrationTest {

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
    private BillRepository billRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private MenuItem vegThali;
    private MenuItem chickenFry;

    @BeforeEach
    void setUp() {
        paymentRepository.deleteAll();
        billRepository.deleteAll();
        orderRepository.deleteAll();
        menuItemRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        User staff = new User();
        staff.setUsername("staff1");
        staff.setEmail("staff1@mahalaxmi.com");
        staff.setPassword(passwordEncoder.encode("Staff@123"));
        staff.setRole(Role.STAFF);
        staff.setEnabled(true);
        userRepository.save(staff);

        MenuCategory thaliCat = new MenuCategory("Thali", 1);
        categoryRepository.save(thaliCat);

        MenuCategory chickenCat = new MenuCategory("Chicken", 2);
        categoryRepository.save(chickenCat);

        vegThali = new MenuItem(thaliCat, "Special Veg Thali", new BigDecimal("170.00"), true, true, 1);
        menuItemRepository.save(vegThali);

        chickenFry = new MenuItem(chickenCat, "Chicken Fry", new BigDecimal("200.00"), false, true, 2);
        menuItemRepository.save(chickenFry);
    }

    @AfterEach
    void tearDown() {
        paymentRepository.deleteAll();
        billRepository.deleteAll();
        orderRepository.deleteAll();
        menuItemRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();
    }

    private Long createTestOrder() throws Exception {
        CreateOrderRequest createReq = new CreateOrderRequest(
                "T4",
                OrderType.DINE_IN,
                "Customer requested less spicy",
                List.of(
                        new OrderItemRequest(vegThali.getId(), 2),  // 340
                        new OrderItemRequest(chickenFry.getId(), 1) // 200
                )
        );

        MvcResult result = mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String json = result.getResponse().getContentAsString();
        return objectMapper.readTree(json).path("data").path("id").asLong();
    }

    @Test
    @WithMockUser(username = "staff1", roles = {"STAFF"})
    void fullBillingLifecycle_cashPayment_completesOrderSuccessfully() throws Exception {
        Long orderId = createTestOrder();

        // 1. Generate Bill for Order
        GenerateBillRequest billReq = new GenerateBillRequest(BigDecimal.ZERO, BigDecimal.ZERO, "Table 4 Bill");
        MvcResult billResult = mockMvc.perform(post("/api/v1/bills/generate/{orderId}", orderId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(billReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderId").value(orderId))
                .andExpect(jsonPath("$.data.subtotal").value(540.00))
                .andExpect(jsonPath("$.data.finalAmount").value(540.00))
                .andExpect(jsonPath("$.data.status").value("UNPAID"))
                .andReturn();

        Long billId = objectMapper.readTree(billResult.getResponse().getContentAsString()).path("data").path("id").asLong();

        // 2. Settle Bill via CASH
        SettleBillRequest settleReq = new SettleBillRequest(
                PaymentMethod.CASH,
                new BigDecimal("540.00"),
                null,
                "Cash collected at table"
        );

        mockMvc.perform(post("/api/v1/bills/{billId}/settle", billId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(settleReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(billId))
                .andExpect(jsonPath("$.data.status").value("PAID"))
                .andExpect(jsonPath("$.data.paidAt").isNotEmpty())
                .andExpect(jsonPath("$.data.payments", hasSize(1)))
                .andExpect(jsonPath("$.data.payments[0].paymentMethod").value("CASH"))
                .andExpect(jsonPath("$.data.payments[0].amount").value(540.00))
                .andExpect(jsonPath("$.data.payments[0].status").value("SUCCESS"));

        // 3. Verify Order status is now COMPLETED
        mockMvc.perform(get("/api/v1/orders/{id}", orderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value(OrderStatus.COMPLETED.name()));
    }

    @Test
    @WithMockUser(username = "staff1", roles = {"STAFF"})
    void fullBillingLifecycle_upiPaymentWithReference_recordsTransactionRef() throws Exception {
        Long orderId = createTestOrder();

        // 1. Generate Bill with ₹40 discount
        GenerateBillRequest billReq = new GenerateBillRequest(new BigDecimal("40.00"), BigDecimal.ZERO, "Discount applied");
        MvcResult billResult = mockMvc.perform(post("/api/v1/bills/generate/{orderId}", orderId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(billReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.subtotal").value(540.00))
                .andExpect(jsonPath("$.data.discountAmount").value(40.00))
                .andExpect(jsonPath("$.data.finalAmount").value(500.00))
                .andReturn();

        Long billId = objectMapper.readTree(billResult.getResponse().getContentAsString()).path("data").path("id").asLong();

        // 2. Settle via UPI QR
        SettleBillRequest settleReq = new SettleBillRequest(
                PaymentMethod.UPI,
                new BigDecimal("500.00"),
                "UPI-REF-998877",
                "Paid via PhonePe QR"
        );

        mockMvc.perform(post("/api/v1/bills/{billId}/settle", billId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(settleReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PAID"))
                .andExpect(jsonPath("$.data.payments[0].paymentMethod").value("UPI"))
                .andExpect(jsonPath("$.data.payments[0].transactionRef").value("UPI-REF-998877"))
                .andExpect(jsonPath("$.data.payments[0].amount").value(500.00));
    }

    @Test
    @WithMockUser(username = "staff1", roles = {"STAFF"})
    void settleBill_alreadyPaid_returns400() throws Exception {
        Long orderId = createTestOrder();

        MvcResult billResult = mockMvc.perform(post("/api/v1/bills/generate/{orderId}", orderId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andReturn();

        Long billId = objectMapper.readTree(billResult.getResponse().getContentAsString()).path("data").path("id").asLong();

        SettleBillRequest settleReq = new SettleBillRequest(PaymentMethod.CASH, new BigDecimal("540.00"), null, null);
        mockMvc.perform(post("/api/v1/bills/{billId}/settle", billId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(settleReq)))
                .andExpect(status().isOk());

        // Attempting to settle again must fail
        mockMvc.perform(post("/api/v1/bills/{billId}/settle", billId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(settleReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("already paid")));
    }
}
