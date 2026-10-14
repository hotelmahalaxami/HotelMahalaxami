package com.mahalaxmi.pos.table.service;

import com.mahalaxmi.pos.common.exception.DuplicateResourceException;
import com.mahalaxmi.pos.common.exception.ResourceNotFoundException;
import com.mahalaxmi.pos.order.entity.Order;
import com.mahalaxmi.pos.order.repository.OrderRepository;
import com.mahalaxmi.pos.table.dto.CreateTableRequest;
import com.mahalaxmi.pos.table.dto.TableResponse;
import com.mahalaxmi.pos.table.dto.UpdateTableRequest;
import com.mahalaxmi.pos.table.entity.RestaurantTable;
import com.mahalaxmi.pos.table.repository.RestaurantTableRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TableServiceImpl implements TableService {

    private static final Logger log = LoggerFactory.getLogger(TableServiceImpl.class);

    private final RestaurantTableRepository tableRepository;
    private final OrderRepository orderRepository;

    public TableServiceImpl(RestaurantTableRepository tableRepository, OrderRepository orderRepository) {
        this.tableRepository = tableRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TableResponse> getAllTables() {
        List<RestaurantTable> tables = tableRepository.findAllByOrderByDisplayOrderAscTableNameAsc();
        return mapTablesWithOccupancy(tables);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TableResponse> getActiveTables() {
        List<RestaurantTable> tables = tableRepository.findByActiveTrueOrderByDisplayOrderAscTableNameAsc();
        return mapTablesWithOccupancy(tables);
    }

    @Override
    @Transactional(readOnly = true)
    public TableResponse getTableById(Long id) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + id));

        Optional<Order> activeOrder = orderRepository.findActiveDineInOrder(table.getTableName());
        return activeOrder
                .map(o -> TableResponse.of(table, true, o.getId(), o.getOrderNumber(), o.getCreatedAt()))
                .orElseGet(() -> TableResponse.of(table, false, null, null, null));
    }

    @Override
    @Transactional
    public TableResponse createTable(CreateTableRequest request) {
        String trimmedName = request.tableName().trim();
        if (tableRepository.existsByTableNameIgnoreCase(trimmedName)) {
            throw new DuplicateResourceException("Table with name '" + trimmedName + "' already exists");
        }

        int capacity = (request.capacity() != null) ? request.capacity() : 4;
        int displayOrder = (request.displayOrder() != null) ? request.displayOrder() : 0;

        RestaurantTable table = new RestaurantTable(trimmedName, capacity, true, displayOrder);
        RestaurantTable saved = tableRepository.save(table);
        log.info("Created new restaurant table: {} (capacity: {})", saved.getTableName(), saved.getCapacity());

        return TableResponse.of(saved, false, null, null, null);
    }

    @Override
    @Transactional
    public TableResponse updateTable(Long id, UpdateTableRequest request) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + id));

        String trimmedName = request.tableName().trim();
        if (tableRepository.existsByTableNameIgnoreCaseAndIdNot(trimmedName, id)) {
            throw new DuplicateResourceException("Table with name '" + trimmedName + "' already exists");
        }

        Optional<Order> activeOrder = orderRepository.findActiveDineInOrder(table.getTableName());

        // Prevent deactivating an occupied table
        if (request.active() != null && !request.active() && activeOrder.isPresent()) {
            throw new IllegalArgumentException("Cannot deactivate table '" + table.getTableName() +
                    "' while it is occupied by active order " + activeOrder.get().getOrderNumber());
        }

        table.setTableName(trimmedName);
        if (request.capacity() != null) {
            table.setCapacity(request.capacity());
        }
        if (request.active() != null) {
            table.setActive(request.active());
        }
        if (request.displayOrder() != null) {
            table.setDisplayOrder(request.displayOrder());
        }

        RestaurantTable saved = tableRepository.save(table);
        log.info("Updated restaurant table: {} (active: {})", saved.getTableName(), saved.isActive());

        return activeOrder
                .map(o -> TableResponse.of(saved, true, o.getId(), o.getOrderNumber(), o.getCreatedAt()))
                .orElseGet(() -> TableResponse.of(saved, false, null, null, null));
    }

    @Override
    @Transactional
    public void deleteTable(Long id) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + id));

        Optional<Order> activeOrder = orderRepository.findActiveDineInOrder(table.getTableName());
        if (activeOrder.isPresent()) {
            throw new IllegalArgumentException("Cannot deactivate table '" + table.getTableName() +
                    "' while it is occupied by active order " + activeOrder.get().getOrderNumber());
        }

        // Soft-deactivate to maintain audit trail and historical consistency
        table.setActive(false);
        tableRepository.save(table);
        log.info("Deactivated restaurant table: {}", table.getTableName());
    }

    private List<TableResponse> mapTablesWithOccupancy(List<RestaurantTable> tables) {
        List<Order> activeOrders = orderRepository.findAllActiveDineInOrders();
        Map<String, Order> occupancyMap = activeOrders.stream()
                .filter(o -> o.getTableNumber() != null && !o.getTableNumber().isBlank())
                .collect(Collectors.toMap(
                        o -> o.getTableNumber().trim().toLowerCase(),
                        o -> o,
                        (existing, replacement) -> existing
                ));

        return tables.stream()
                .map(t -> {
                    Order active = occupancyMap.get(t.getTableName().trim().toLowerCase());
                    boolean isOccupied = (active != null);
                    Long orderId = isOccupied ? active.getId() : null;
                    String orderNumber = isOccupied ? active.getOrderNumber() : null;
                    var occupiedSince = isOccupied ? active.getCreatedAt() : null;
                    return TableResponse.of(t, isOccupied, orderId, orderNumber, occupiedSince);
                })
                .toList();
    }
}
