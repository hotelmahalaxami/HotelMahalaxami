package com.mahalaxmi.pos.order.repository;

import com.mahalaxmi.pos.order.entity.OrderIdempotencyKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OrderIdempotencyKeyRepository extends JpaRepository<OrderIdempotencyKey, Long> {
    Optional<OrderIdempotencyKey> findByIdempotencyKey(String idempotencyKey);
    void deleteByExpiresAtBefore(LocalDateTime now);
}
