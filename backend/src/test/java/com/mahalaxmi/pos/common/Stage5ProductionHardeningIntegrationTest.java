package com.mahalaxmi.pos.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mahalaxmi.pos.billing.dto.GenerateBillRequest;
import com.mahalaxmi.pos.billing.dto.SettleBillRequest;
import com.mahalaxmi.pos.billing.entity.PaymentMethod;
import com.mahalaxmi.pos.billing.repository.BillRepository;
import com.mahalaxmi.pos.billing.repository.PaymentRepository;
import com.mahalaxmi.pos.billing.service.BillingService;
import com.mahalaxmi.pos.menu.entity.MenuCategory;
import com.mahalaxmi.pos.menu.entity.MenuItem;
import com.mahalaxmi.pos.menu.repository.MenuCategoryRepository;
import com.mahalaxmi.pos.menu.repository.MenuItemRepository;
import com.mahalaxmi.pos.order.dto.CreateOrderRequest;
import com.mahalaxmi.pos.order.dto.OrderItemRequest;
import com.mahalaxmi.pos.order.entity.OrderType;
import com.mahalaxmi.pos.order.repository.OrderItemRepository;
import com.mahalaxmi.pos.order.repository.OrderRepository;
import com.mahalaxmi.pos.order.service.OrderService;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class Stage5ProductionHardeningIntegrationTest {

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

        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@mahalaxmi.com");
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.setRole(Role.ADMIN);
        admin.setEnabled(true);
        userRepository.save(admin);

        User staff = new User();
        staff.setUsername("staff1");
        staff.setEmail("staff1@mahalaxmi.com");
        staff.setPassword(passwordEncoder.encode("Staff@123"));
        staff.setRole(Role.STAFF);
        staff.setEnabled(true);
        userRepository.save(staff);

        MenuCategory cat = new MenuCategory("Thali", 1);
        cat = categoryRepository.save(cat);

        vegThali = new MenuItem(cat, "Special Veg Thali", new BigDecimal("170.00"), true, true, 1);
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
    @WithMockUser(username = "staff1", roles = {"STAFF"})
    void priceManipulationPrevention_enforcesDatabasePriceOnly() {
        // Even if client attempts to pass a quantity of 2, price is strictly calculated from DB (170 * 2 = 340)
        var order = orderService.createOrder(new CreateOrderRequest(
                "T1", OrderType.DINE_IN, "No tampering allowed",
                List.of(new OrderItemRequest(vegThali.getId(), 2))
        ), "staff1");

        assertThat(order.totalAmount()).isEqualByComparingTo(new BigDecimal("340.00"));
        assertThat(order.items().get(0).unitPrice()).isEqualByComparingTo(new BigDecimal("170.00"));
        assertThat(order.items().get(0).subtotal()).isEqualByComparingTo(new BigDecimal("340.00"));
    }

    @Test
    @WithMockUser(username = "staff1", roles = {"STAFF"})
    void doubleSettlementPrevention_rejectsSecondPaymentAttempt() {
        var order = orderService.createOrder(new CreateOrderRequest(
                "T2", OrderType.DINE_IN, null,
                List.of(new OrderItemRequest(vegThali.getId(), 1))
        ), "staff1");

        var bill = billingService.generateBillForOrder(
                order.id(), new GenerateBillRequest(BigDecimal.ZERO, BigDecimal.ZERO, null), "staff1"
        );

        // First settlement succeeds
        billingService.settleBill(bill.id(), new SettleBillRequest(
                PaymentMethod.CASH, new BigDecimal("170.00"), null, null
        ), "staff1");

        // Concurrent or repeated second settlement attempt is rejected
        assertThatThrownBy(() -> billingService.settleBill(bill.id(), new SettleBillRequest(
                PaymentMethod.CASH, new BigDecimal("170.00"), null, null
        ), "staff1"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already paid");
    }

    @Test
    @WithMockUser(username = "staff1", roles = {"STAFF"})
    void underpaymentPrevention_rejectsAmountLowerThanBillTotal() {
        var order = orderService.createOrder(new CreateOrderRequest(
                "T3", OrderType.DINE_IN, null,
                List.of(new OrderItemRequest(vegThali.getId(), 1))
        ), "staff1");

        var bill = billingService.generateBillForOrder(
                order.id(), new GenerateBillRequest(BigDecimal.ZERO, BigDecimal.ZERO, null), "staff1"
        );

        // Attempting to pay 100 on a 170 bill throws IllegalArgumentException
        assertThatThrownBy(() -> billingService.settleBill(bill.id(), new SettleBillRequest(
                PaymentMethod.CASH, new BigDecimal("100.00"), null, null
        ), "staff1"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cannot be less than bill total");
    }

    @Test
    @WithMockUser(username = "staff1", roles = {"STAFF"})
    void roleBasedAccessControl_staffForbiddenFromAdminAndReports() throws Exception {
        // Staff cannot view or export executive reports
        mockMvc.perform(get("/api/v1/reports/dashboard-summary"))
                .andExpect(status().isForbidden());

        // Staff cannot view or alter staff users
        mockMvc.perform(get("/api/v1/admin/staff"))
                .andExpect(status().isForbidden());

        // Staff cannot delete or update menu items
        mockMvc.perform(delete("/api/v1/menu/items/" + vegThali.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "staff1", roles = {"STAFF"})
    void validationErrors_returnedAsSafeJsonWithoutStackTraces() throws Exception {
        // Send invalid empty order
        mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"items\":[]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.validationErrors.items").exists())
                .andExpect(jsonPath("$.stackTrace").doesNotExist());
    }
}
