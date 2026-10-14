package com.mahalaxmi.pos.table.service;

import com.mahalaxmi.pos.table.dto.CreateTableRequest;
import com.mahalaxmi.pos.table.dto.TableResponse;
import com.mahalaxmi.pos.table.dto.UpdateTableRequest;

import java.util.List;

public interface TableService {
    List<TableResponse> getAllTables();
    List<TableResponse> getActiveTables();
    TableResponse getTableById(Long id);
    TableResponse createTable(CreateTableRequest request);
    TableResponse updateTable(Long id, UpdateTableRequest request);
    void deleteTable(Long id);
}
