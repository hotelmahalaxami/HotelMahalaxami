package com.mahalaxmi.pos.menu.repository;

import com.mahalaxmi.pos.menu.entity.MenuCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuCategoryRepository extends JpaRepository<MenuCategory, Long> {
    List<MenuCategory> findByActiveTrueOrderByDisplayOrderAscNameAsc();
    Optional<MenuCategory> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}
