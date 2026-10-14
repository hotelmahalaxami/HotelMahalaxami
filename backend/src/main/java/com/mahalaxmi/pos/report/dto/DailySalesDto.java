package com.mahalaxmi.pos.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailySalesDto(
        LocalDate date,
        BigDecimal totalRevenue,
        long ordersCount,
        BigDecimal cashTotal,
        BigDecimal upiTotal,
        BigDecimal cardTotal
) {
}
