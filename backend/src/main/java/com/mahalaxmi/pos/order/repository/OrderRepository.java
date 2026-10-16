package com.mahalaxmi.pos.order.repository;

import com.mahalaxmi.pos.order.entity.Order;
import com.mahalaxmi.pos.order.entity.OrderStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("""
        SELECT DISTINCT o FROM Order o
        LEFT JOIN FETCH o.items i
        LEFT JOIN FETCH o.createdBy
        WHERE o.id = :id
    """)
    Optional<Order> findByIdWithItems(@Param("id") Long id);

    @Query("""
        SELECT DISTINCT o FROM Order o
        LEFT JOIN FETCH o.items i
        LEFT JOIN FETCH o.createdBy
        ORDER BY o.createdAt DESC
    """)
    List<Order> findAllWithItems();

    @Query("""
        SELECT DISTINCT o FROM Order o
        LEFT JOIN FETCH o.items i
        LEFT JOIN FETCH o.createdBy
        WHERE o.status = :status
        ORDER BY o.createdAt DESC
    """)
    List<Order> findByStatusWithItems(@Param("status") OrderStatus status);

    long countByStatus(OrderStatus status);

    long countByStatusAndCreatedAtBetween(OrderStatus status, java.time.LocalDateTime start, java.time.LocalDateTime end);

    long countByCreatedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);

    @Query("""
        SELECT DISTINCT o FROM Order o
        LEFT JOIN FETCH o.items i
        LEFT JOIN FETCH o.createdBy
        WHERE o.orderNumber = :orderNumber
    """)
    Optional<Order> findByOrderNumberWithItems(@Param("orderNumber") String orderNumber);

    @Query("""
        SELECT o FROM Order o
        WHERE o.orderType = com.mahalaxmi.pos.order.entity.OrderType.DINE_IN
          AND o.status = com.mahalaxmi.pos.order.entity.OrderStatus.OPEN
          AND LOWER(TRIM(o.tableNumber)) = LOWER(TRIM(:tableNumber))
    """)
    Optional<Order> findActiveDineInOrder(@Param("tableNumber") String tableNumber);

    @Query("""
        SELECT o FROM Order o
        WHERE o.orderType = com.mahalaxmi.pos.order.entity.OrderType.DINE_IN
          AND o.status = com.mahalaxmi.pos.order.entity.OrderStatus.OPEN
    """)
    List<Order> findAllActiveDineInOrders();

    @Query("""
        SELECT o FROM Order o
        LEFT JOIN FETCH o.createdBy
        ORDER BY o.createdAt DESC
    """)
    List<Order> findRecentOrders(Pageable pageable);

    @Query("""
        SELECT DISTINCT o FROM Order o
        LEFT JOIN FETCH o.items i
        WHERE o.id IN :orderIds
    """)
    List<Order> fetchItemsForOrders(@Param("orderIds") List<Long> orderIds);

    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countOrdersByStatusRaw();

}
