package com.mahalaxmi.pos.report;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mahalaxmi.pos.billing.dto.GenerateBillRequest;
import com.mahalaxmi.pos.billing.dto.SettleBillRequest;
import com.mahalaxmi.pos.billing.entity.PaymentMethod;
import com.mahalaxmi.pos.billing.repository.BillRepository;
import com.mahalaxmi.pos.billing.repository.PaymentRepository;
import com.mahalaxmi.pos.billing.service.BillingService;
import com.mahalaxmi.pos.menu.dto.CreateMenuItemRequest;
import com.mahalaxmi.pos.menu.dto.UpdateMenuItemRequest;
import com.mahalaxmi.pos.menu.entity.MenuCategory;
import com.mahalaxmi.pos.menu.entity.MenuItem;
import com.mahalaxmi.pos.menu.repository.MenuCategoryRepository;
import com.mahalaxmi.pos.menu.repository.MenuItemRepository;
import com.mahalaxmi.pos.order.dto.CreateOrderRequest;
import com.mahalaxmi.pos.order.dto.OrderItemRequest;
import com.mahalaxmi.pos.order.entity.Order;
import com.mahalaxmi.pos.order.entity.OrderType;
import com.mahalaxmi.pos.order.repository.OrderItemRepository;
import com.mahalaxmi.pos.order.repository.OrderRepository;
import com.mahalaxmi.pos.order.service.OrderService;
import com.mahalaxmi.pos.user.dto.CreateStaffRequest;
import com.mahalaxmi.pos.user.dto.ResetPasswordRequest;
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

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class Stage4AdminAndReportsIntegrationTest {

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
    private OrderItemRepository orderItemRepository;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderService orderService;

    @Autowired
    private BillingService billingService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private MenuCategory thaliCategory;
    private MenuItem vegThali;

    @BeforeEach
    void setUp() {
        paymentRepository.deleteAll();
        billRepository.deleteAll();
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();
        menuItemRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        // Seed Admin user
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@mahalaxmi.com");
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.setRole(Role.ADMIN);
        admin.setEnabled(true);
        userRepository.save(admin);

        // Seed Category & Item
        thaliCategory = new MenuCategory("Thali", 1);
        thaliCategory = categoryRepository.save(thaliCategory);

        vegThali = new MenuItem(thaliCategory, "Special Veg Thali", new BigDecimal("170.00"), true, true, 1);
        vegThali = menuItemRepository.save(vegThali);
    }

    @AfterEach
    void tearDown() {
        paymentRepository.deleteAll();
        billRepository.deleteAll();
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();
        menuItemRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void adminCanUpdateItemPrice_andToggleAvailability() throws Exception {
        // Price update: Special Veg Thali ₹170 -> ₹180
        UpdateMenuItemRequest updateReq = new UpdateMenuItemRequest(
                thaliCategory.getId(),
                "Special Veg Thali",
                new BigDecimal("180.00"),
                true,
                true,
                1
        );

        mockMvc.perform(put("/api/v1/menu/items/" + vegThali.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.price").value(180.00))
                .andExpect(jsonPath("$.data.name").value("Special Veg Thali"));

        // Toggle availability to false
        mockMvc.perform(patch("/api/v1/menu/items/" + vegThali.getId() + "/toggle-availability")
                        .param("available", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.available").value(false));

        // Public GET should not show sold-out items
        mockMvc.perform(get("/api/v1/menu/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));

        // Admin GET shows it
        mockMvc.perform(get("/api/v1/menu/items/admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].available").value(false));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void adminCanManageStaff_createToggleReset() throws Exception {
        // 1. Create Staff
        CreateStaffRequest staffReq = new CreateStaffRequest("waiter1", "waiter1@mahalaxmi.com", "Password@123", Role.STAFF);
        mockMvc.perform(post("/api/v1/admin/staff")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(staffReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.username").value("waiter1"))
                .andExpect(jsonPath("$.data.role").value("STAFF"))
                .andExpect(jsonPath("$.data.enabled").value(true));

        User waiter = userRepository.findByUsername("waiter1").orElseThrow();

        // 2. Toggle Status to Disabled
        mockMvc.perform(patch("/api/v1/admin/staff/" + waiter.getId() + "/toggle-status")
                        .param("enabled", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.enabled").value(false));

        // 3. Reset Password
        ResetPasswordRequest resetReq = new ResetPasswordRequest("NewSecret@456");
        mockMvc.perform(put("/api/v1/admin/staff/" + waiter.getId() + "/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password reset successfully"));
    }

    @Test
    @WithMockUser(username = "staff", roles = {"STAFF"})
    void staffCannotAccessAdminEndpoints_returnsForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/admin/staff"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/reports/dashboard-summary"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void reports_dashboardSummary_calculatesSalesAndTopItemsAccurately() throws Exception {
        // Order 1: 2x Special Veg Thali (2 * 170 = 340) paid via CASH
        var order1Resp = orderService.createOrder(new CreateOrderRequest(
                "T-1", OrderType.DINE_IN, "Customer 1",
                List.of(new OrderItemRequest(vegThali.getId(), 2))
        ), "admin");

        var bill1Resp = billingService.generateBillForOrder(
                order1Resp.id(), new GenerateBillRequest(BigDecimal.ZERO, BigDecimal.ZERO, null), "admin"
        );

        billingService.settleBill(bill1Resp.id(), new SettleBillRequest(
                PaymentMethod.CASH, new BigDecimal("340.00"), null, null
        ), "admin");

        // Order 2: 1x Special Veg Thali (170) paid via UPI
        var order2Resp = orderService.createOrder(new CreateOrderRequest(
                null, OrderType.PARCEL, "Customer 2",
                List.of(new OrderItemRequest(vegThali.getId(), 1))
        ), "admin");

        var bill2Resp = billingService.generateBillForOrder(
                order2Resp.id(), new GenerateBillRequest(BigDecimal.ZERO, BigDecimal.ZERO, null), "admin"
        );

        billingService.settleBill(bill2Resp.id(), new SettleBillRequest(
                PaymentMethod.UPI, new BigDecimal("170.00"), "UPI-REF-999", null
        ), "admin");

        // Fetch Dashboard Summary
        mockMvc.perform(get("/api/v1/reports/dashboard-summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalOrdersCount").value(2))
                .andExpect(jsonPath("$.data.totalRevenue").value(510.00))
                .andExpect(jsonPath("$.data.cashTotal").value(340.00))
                .andExpect(jsonPath("$.data.upiTotal").value(170.00))
                .andExpect(jsonPath("$.data.topItem.itemName").value("Special Veg Thali"))
                .andExpect(jsonPath("$.data.topItem.quantitySold").value(3))
                .andExpect(jsonPath("$.data.topItem.totalRevenue").value(510.00));

        // Fetch Item Wise Sales
        mockMvc.perform(get("/api/v1/reports/item-wise-sales"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].itemName").value("Special Veg Thali"))
                .andExpect(jsonPath("$.data[0].quantitySold").value(3))
                .andExpect(jsonPath("$.data[0].totalRevenue").value(510.00));

        // Fetch Daily Sales
        mockMvc.perform(get("/api/v1/reports/daily-sales"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", not(empty())));

        // Fetch Monthly Sales
        mockMvc.perform(get("/api/v1/reports/monthly-sales"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(12)));
    }
}
