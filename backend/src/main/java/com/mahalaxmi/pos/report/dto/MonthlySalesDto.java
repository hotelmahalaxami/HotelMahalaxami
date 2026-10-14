package com.mahalaxmi.pos.report.dto;

import java.math.BigDecimal;

public record MonthlySalesDto(
        int year,
        int month,
        String monthName,
        BigDecimal totalRevenue,
        long ordersCount
) {
}
