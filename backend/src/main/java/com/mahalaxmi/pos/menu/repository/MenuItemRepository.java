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
        WHERE m.available = true AND c.active = true
        ORDER BY c.displayOrder ASC, m.displayOrder ASC, m.name ASC
    """)
    List<MenuItem> findAllAvailable();

    @Query("""
        SELECT m FROM MenuItem m
        JOIN FETCH m.category c
        WHERE m.available = true AND c.active = true AND c.id = :categoryId
        ORDER BY c.displayOrder ASC, m.displayOrder ASC, m.name ASC
    """)
    List<MenuItem> findAvailableByCategory(@Param("categoryId") Long categoryId);

    @Query("""
        SELECT m FROM MenuItem m
        JOIN FETCH m.category c
        WHERE m.available = true AND c.active = true AND LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%'))
        ORDER BY c.displayOrder ASC, m.displayOrder ASC, m.name ASC
    """)
    List<MenuItem> findAvailableBySearch(@Param("search") String search);

    @Query("""
        SELECT m FROM MenuItem m
        JOIN FETCH m.category c
        WHERE m.available = true AND c.active = true AND c.id = :categoryId AND LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%'))
        ORDER BY c.displayOrder ASC, m.displayOrder ASC, m.name ASC
    """)
    List<MenuItem> findAvailableByCategoryAndSearch(
            @Param("categoryId") Long categoryId,
            @Param("search") String search
    );
}
