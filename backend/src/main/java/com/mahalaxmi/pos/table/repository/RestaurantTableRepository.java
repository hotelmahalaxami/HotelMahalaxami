package com.mahalaxmi.pos.table.repository;

import com.mahalaxmi.pos.table.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {
    Optional<RestaurantTable> findByTableName(String tableName);
    Optional<RestaurantTable> findByTableNameIgnoreCase(String tableName);
    boolean existsByTableNameIgnoreCase(String tableName);
    boolean existsByTableNameIgnoreCaseAndIdNot(String tableName, Long id);
    List<RestaurantTable> findAllByOrderByDisplayOrderAscTableNameAsc();
    List<RestaurantTable> findByActiveTrueOrderByDisplayOrderAscTableNameAsc();
}
