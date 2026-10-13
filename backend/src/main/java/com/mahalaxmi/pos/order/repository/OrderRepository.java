package com.mahalaxmi.pos.order.repository;

import com.mahalaxmi.pos.order.entity.Order;
import com.mahalaxmi.pos.order.entity.OrderStatus;
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
        WHERE (:status IS NULL OR o.status = :status)
        ORDER BY o.createdAt DESC
    """)
    List<Order> findOrdersWithItems(@Param("status") OrderStatus status);
}
