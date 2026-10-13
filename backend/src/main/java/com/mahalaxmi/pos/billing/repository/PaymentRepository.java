package com.mahalaxmi.pos.billing.repository;

import com.mahalaxmi.pos.billing.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByBillIdOrderByCreatedAtDesc(Long billId);
}
