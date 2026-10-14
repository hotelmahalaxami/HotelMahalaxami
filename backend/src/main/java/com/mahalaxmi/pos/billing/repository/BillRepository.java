package com.mahalaxmi.pos.billing.repository;

import com.mahalaxmi.pos.billing.entity.Bill;
import com.mahalaxmi.pos.billing.entity.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {

    Optional<Bill> findByBillNumber(String billNumber);

    Optional<Bill> findByOrderId(Long orderId);

    @Query("""
        SELECT DISTINCT b FROM Bill b
        JOIN FETCH b.order o
        LEFT JOIN FETCH o.items i
        LEFT JOIN FETCH b.payments p
        LEFT JOIN FETCH b.createdBy
        WHERE b.id = :id
    """)
    Optional<Bill> findByIdWithDetails(@Param("id") Long id);

    @Query("""
        SELECT DISTINCT b FROM Bill b
        JOIN FETCH b.order o
        LEFT JOIN FETCH o.items i
        LEFT JOIN FETCH b.payments p
        LEFT JOIN FETCH b.createdBy
        WHERE o.id = :orderId
    """)
    Optional<Bill> findByOrderIdWithDetails(@Param("orderId") Long orderId);

    @Query("""
        SELECT DISTINCT b FROM Bill b
        JOIN FETCH b.order o
        LEFT JOIN FETCH b.payments p
        LEFT JOIN FETCH b.createdBy
        ORDER BY b.createdAt DESC
    """)
    List<Bill> findAllWithDetails();

    @Query("""
        SELECT DISTINCT b FROM Bill b
        JOIN FETCH b.order o
        LEFT JOIN FETCH b.payments p
        LEFT JOIN FETCH b.createdBy
        WHERE b.status = :status
        ORDER BY b.createdAt DESC
    """)
    List<Bill> findByStatusWithDetails(@Param("status") BillStatus status);

    @Query("""
        SELECT DISTINCT b FROM Bill b
        JOIN FETCH b.order o
        LEFT JOIN FETCH b.payments p
        LEFT JOIN FETCH b.createdBy
        WHERE b.status = com.mahalaxmi.pos.billing.entity.BillStatus.PAID
          AND b.paidAt >= :startDate AND b.paidAt <= :endDate
        ORDER BY b.paidAt DESC
    """)
    List<Bill> findPaidBillsBetween(
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate
    );
}
