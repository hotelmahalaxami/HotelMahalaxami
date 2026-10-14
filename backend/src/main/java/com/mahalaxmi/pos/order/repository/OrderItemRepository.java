package com.mahalaxmi.pos.order.repository;

import com.mahalaxmi.pos.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("""
        SELECT oi.menuItem.id, oi.itemName, oi.menuItem.category.name, SUM(oi.quantity), SUM(oi.subtotal)
        FROM OrderItem oi
        JOIN oi.order o
        WHERE o.status = com.mahalaxmi.pos.order.entity.OrderStatus.COMPLETED
          AND oi.status = com.mahalaxmi.pos.order.entity.OrderItemStatus.ACTIVE
          AND o.createdAt >= :startDate AND o.createdAt <= :endDate
        GROUP BY oi.menuItem.id, oi.itemName, oi.menuItem.category.name
        ORDER BY SUM(oi.quantity) DESC
    """)
    List<Object[]> getItemSalesBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
