package com.mahalaxmi.pos.table;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mahalaxmi.pos.auth.dto.LoginRequest;
import com.mahalaxmi.pos.auth.dto.LoginResponse;
import com.mahalaxmi.pos.billing.repository.BillRepository;
import com.mahalaxmi.pos.billing.repository.PaymentRepository;
import com.mahalaxmi.pos.common.response.ApiResponse;
import com.mahalaxmi.pos.menu.entity.MenuCategory;
import com.mahalaxmi.pos.menu.entity.MenuItem;
import com.mahalaxmi.pos.menu.repository.MenuCategoryRepository;
import com.mahalaxmi.pos.menu.repository.MenuItemRepository;
import com.mahalaxmi.pos.order.dto.CreateOrderRequest;
import com.mahalaxmi.pos.order.dto.OrderItemRequest;
import com.mahalaxmi.pos.order.entity.OrderType;
import com.mahalaxmi.pos.order.repository.OrderRepository;
import com.mahalaxmi.pos.table.dto.CreateTableRequest;
import com.mahalaxmi.pos.table.dto.UpdateTableRequest;
import com.mahalaxmi.pos.table.entity.RestaurantTable;
import com.mahalaxmi.pos.table.repository.RestaurantTableRepository;
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
class TableManagementAndOccupancyIntegrationTest {

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
    private RestaurantTableRepository tableRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String adminToken;
    private String staffToken;
    private MenuItem testDish;

    @BeforeEach
    void setUp() throws Exception {
        paymentRepository.deleteAll();
        billRepository.deleteAll();
        orderRepository.deleteAll();
        tableRepository.deleteAll();
        menuItemRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        // Seed users
        User adminUser = new User("admin1", "admin1@mahalaxmi.com", passwordEncoder.encode("password123"), Role.ADMIN, true);
        User staffUser = new User("staff1", "staff1@mahalaxmi.com", passwordEncoder.encode("password123"), Role.STAFF, true);
        userRepository.saveAll(List.of(adminUser, staffUser));

        // Seed dish
        MenuCategory cat = categoryRepository.save(new MenuCategory("Thali", 1, true));
        testDish = menuItemRepository.save(new MenuItem(cat, "Veg Thali", new BigDecimal("170.00"), true, true, 1));

        // Seed tables
        tableRepository.save(new RestaurantTable("Table 1", 4, true, 1));
        tableRepository.save(new RestaurantTable("Table 2", 4, true, 2));
        tableRepository.save(new RestaurantTable("Table 3", 6, true, 3));

        // Login Admin
        MvcResult adminLogin = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("admin1", "password123"))))
                .andExpect(status().isOk())
                .andReturn();
        adminToken = objectMapper.readTree(adminLogin.getResponse().getContentAsString()).at("/data/accessToken").asText();

        // Login Staff
        MvcResult staffLogin = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("staff1", "password123"))))
                .andExpect(status().isOk())
                .andReturn();
        staffToken = objectMapper.readTree(staffLogin.getResponse().getContentAsString()).at("/data/accessToken").asText();
    }

    @AfterEach
    void tearDown() {
        paymentRepository.deleteAll();
        billRepository.deleteAll();
        orderRepository.deleteAll();
        tableRepository.deleteAll();
        menuItemRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void tableOccupancy_dineInOrderMarksTableOccupied() throws Exception {
        // Staff creates order on Table 1
        CreateOrderRequest req = new CreateOrderRequest(
                "Table 1",
                OrderType.DINE_IN,
                "Seated customer",
                List.of(new OrderItemRequest(testDish.getId(), 2))
        );

        mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.tableNumber").value("Table 1"))
                .andExpect(jsonPath("$.data.status").value("OPEN"));

        // GET /api/v1/tables should show Table 1 as occupied
        mockMvc.perform(get("/api/v1/tables")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.tableName == 'Table 1')].isOccupied").value(true))
                .andExpect(jsonPath("$.data[?(@.tableName == 'Table 2')].isOccupied").value(false));
    }

    @Test
    void tableConflict_preventsSecondActiveDineInOrderOnSameTable() throws Exception {
        // First order on Table 2 succeeds
        CreateOrderRequest req1 = new CreateOrderRequest(
                "Table 2",
                OrderType.DINE_IN,
                "First party",
                List.of(new OrderItemRequest(testDish.getId(), 1))
        );

        mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isCreated());

        // Second order on Table 2 while first is OPEN must be rejected with 409 Conflict
        CreateOrderRequest req2 = new CreateOrderRequest(
                "Table 2",
                OrderType.DINE_IN,
                "Conflicting party",
                List.of(new OrderItemRequest(testDish.getId(), 2))
        );

        mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Table 'Table 2' is currently occupied")));
    }

    @Test
    void billGeneration_releasesTableImmediatelyForNewOrder() throws Exception {
        // 1. Create order on Table 3
        CreateOrderRequest req = new CreateOrderRequest(
                "Table 3",
                OrderType.DINE_IN,
                "Customer party",
                List.of(new OrderItemRequest(testDish.getId(), 1))
        );

        MvcResult orderRes = mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        long orderId = objectMapper.readTree(orderRes.getResponse().getContentAsString()).at("/data/id").asLong();

        // Verify Table 3 is occupied
        mockMvc.perform(get("/api/v1/tables")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.tableName == 'Table 3')].isOccupied").value(true));

        // 2. Generate bill for order -> table becomes available immediately
        mockMvc.perform(post("/api/v1/bills/generate/" + orderId)
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("UNPAID"));

        // Table 3 is now free!
        mockMvc.perform(get("/api/v1/tables")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.tableName == 'Table 3')].isOccupied").value(false));

        // 3. New customer can now be seated at Table 3 even while previous bill is unpaid!
        CreateOrderRequest reqNewCustomer = new CreateOrderRequest(
                "Table 3",
                OrderType.DINE_IN,
                "New customer party",
                List.of(new OrderItemRequest(testDish.getId(), 2))
        );

        mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqNewCustomer)))
                .andExpect(status().isCreated());
    }

    @Test
    void parcelOrder_neverOccupiesDiningTable() throws Exception {
        CreateOrderRequest parcelReq = new CreateOrderRequest(
                null,
                OrderType.PARCEL,
                "Takeaway pack",
                List.of(new OrderItemRequest(testDish.getId(), 1))
        );

        mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(parcelReq)))
                .andExpect(status().isCreated());

        // All tables remain available
        mockMvc.perform(get("/api/v1/tables")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].isOccupied", everyItem(is(false))));
    }

    @Test
    void adminTableManagement_rbacAndCrud() throws Exception {
        // Staff cannot create a table -> 403 Forbidden
        CreateTableRequest newTableReq = new CreateTableRequest("Table 9", 4, 9);
        mockMvc.perform(post("/api/v1/tables")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newTableReq)))
                .andExpect(status().isForbidden());

        // Admin creates a table -> 201 Created
        MvcResult createRes = mockMvc.perform(post("/api/v1/tables")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newTableReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.tableName").value("Table 9"))
                .andReturn();

        long tableId = objectMapper.readTree(createRes.getResponse().getContentAsString()).at("/data/id").asLong();

        // Admin updates capacity
        UpdateTableRequest updateReq = new UpdateTableRequest("Table 9-VIP", 8, true, 9);
        mockMvc.perform(put("/api/v1/tables/" + tableId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.tableName").value("Table 9-VIP"))
                .andExpect(jsonPath("$.data.capacity").value(8));

        // Admin deactivates table
        mockMvc.perform(delete("/api/v1/tables/" + tableId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // Active list should not include deactivated table
        mockMvc.perform(get("/api/v1/tables")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.tableName == 'Table 9-VIP')]").doesNotExist());
    }

    @Test
    void getOrderByNumber_returnsSavedOrder() throws Exception {
        CreateOrderRequest req = new CreateOrderRequest(
                "Table 1",
                OrderType.DINE_IN,
                "Seated customer",
                List.of(new OrderItemRequest(testDish.getId(), 2))
        );

        MvcResult createRes = mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        String orderNum = objectMapper.readTree(createRes.getResponse().getContentAsString()).at("/data/orderNumber").asText();

        mockMvc.perform(get("/api/v1/orders/by-number/" + orderNum)
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderNumber").value(orderNum))
                .andExpect(jsonPath("$.data.totalAmount").value(340.00))
                .andExpect(jsonPath("$.data.items", hasSize(1)));
    }
}
