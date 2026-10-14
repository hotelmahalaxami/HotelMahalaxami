package com.mahalaxmi.pos.table.controller;

import com.mahalaxmi.pos.common.response.ApiResponse;
import com.mahalaxmi.pos.table.dto.CreateTableRequest;
import com.mahalaxmi.pos.table.dto.TableResponse;
import com.mahalaxmi.pos.table.dto.UpdateTableRequest;
import com.mahalaxmi.pos.table.service.TableService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tables")
public class TableController {

    private final TableService tableService;

    public TableController(TableService tableService) {
        this.tableService = tableService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TableResponse>>> getTables(
            @RequestParam(name = "all", defaultValue = "false") boolean all
    ) {
        List<TableResponse> tables = all ? tableService.getAllTables() : tableService.getActiveTables();
        return ResponseEntity.ok(ApiResponse.ok(tables));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TableResponse>> getTableById(@PathVariable Long id) {
        TableResponse response = tableService.getTableById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TableResponse>> createTable(@Valid @RequestBody CreateTableRequest request) {
        TableResponse response = tableService.createTable(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Table created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TableResponse>> updateTable(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTableRequest request
    ) {
        TableResponse response = tableService.updateTable(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Table updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTable(@PathVariable Long id) {
        tableService.deleteTable(id);
        return ResponseEntity.ok(ApiResponse.message("Table deactivated successfully"));
    }
}
