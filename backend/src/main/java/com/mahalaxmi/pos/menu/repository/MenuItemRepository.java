package com.mahalaxmi.pos.menu.repository;

import com.mahalaxmi.pos.menu.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    @Query("""
        SELECT m FROM MenuItem m
        JOIN FETCH m.category c
        WHERE m.available = true
          AND c.active = true
          AND (:categoryId IS NULL OR c.id = :categoryId)
          AND (:search IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY c.displayOrder ASC, m.displayOrder ASC, m.name ASC
    """)
    List<MenuItem> findAvailableItems(
            @Param("categoryId") Long categoryId,
            @Param("search") String search
    );
}
