package com.mahalaxmi.pos.report.dto;

import java.math.BigDecimal;

public record ItemSalesDto(
        Long menuItemId,
        String itemName,
        String categoryName,
        long quantitySold,
        BigDecimal totalRevenue
) {
}
