package com.mahalaxmi.pos.report.service;

import com.mahalaxmi.pos.report.dto.DailySalesDto;
import com.mahalaxmi.pos.report.dto.DashboardSummaryResponse;
import com.mahalaxmi.pos.report.dto.ItemSalesDto;
import com.mahalaxmi.pos.report.dto.MonthlySalesDto;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {
    DashboardSummaryResponse getDashboardSummary(LocalDate date);
    List<DailySalesDto> getDailySales(LocalDate startDate, LocalDate endDate);
    List<ItemSalesDto> getItemWiseSales(LocalDate startDate, LocalDate endDate);
    List<MonthlySalesDto> getMonthlySales(int year);
}
