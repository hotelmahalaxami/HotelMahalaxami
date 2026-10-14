package com.mahalaxmi.pos.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record DashboardSummaryResponse(
        LocalDate reportDate,
        BigDecimal totalRevenue,
        long totalOrdersCount,
        BigDecimal cashTotal,
        BigDecimal upiTotal,
        BigDecimal cardTotal,
        long cancelledOrdersCount,
        long openOrdersCount,
        TopItemDto topItem,
        List<TopItemDto> topSellingItems,
        List<DailySalesDto> recentDailySales
) {
}
