package com.mahalaxmi.pos.report.controller;

import com.mahalaxmi.pos.common.response.ApiResponse;
import com.mahalaxmi.pos.report.dto.DailySalesDto;
import com.mahalaxmi.pos.report.dto.DashboardSummaryResponse;
import com.mahalaxmi.pos.report.dto.ItemSalesDto;
import com.mahalaxmi.pos.report.dto.MonthlySalesDto;
import com.mahalaxmi.pos.report.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard-summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getDashboardSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        DashboardSummaryResponse summary = reportService.getDashboardSummary(date);
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @GetMapping("/daily-sales")
    public ResponseEntity<ApiResponse<List<DailySalesDto>>> getDailySales(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<DailySalesDto> dailySales = reportService.getDailySales(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(dailySales));
    }

    @GetMapping("/item-wise-sales")
    public ResponseEntity<ApiResponse<List<ItemSalesDto>>> getItemWiseSales(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<ItemSalesDto> itemSales = reportService.getItemWiseSales(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(itemSales));
    }

    @GetMapping("/monthly-sales")
    public ResponseEntity<ApiResponse<List<MonthlySalesDto>>> getMonthlySales(
            @RequestParam(required = false) Integer year
    ) {
        int targetYear = (year != null && year > 2000) ? year : LocalDate.now().getYear();
        List<MonthlySalesDto> monthlySales = reportService.getMonthlySales(targetYear);
        return ResponseEntity.ok(ApiResponse.ok(monthlySales));
    }
}
