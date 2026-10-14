package com.mahalaxmi.pos.report.service;

import com.mahalaxmi.pos.billing.entity.Bill;
import com.mahalaxmi.pos.billing.entity.Payment;
import com.mahalaxmi.pos.billing.repository.BillRepository;
import com.mahalaxmi.pos.order.entity.OrderStatus;
import com.mahalaxmi.pos.order.repository.OrderItemRepository;
import com.mahalaxmi.pos.order.repository.OrderRepository;
import com.mahalaxmi.pos.report.dto.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final BillRepository billRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public ReportServiceImpl(BillRepository billRepository,
                             OrderRepository orderRepository,
                             OrderItemRepository orderItemRepository) {
        this.billRepository = billRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @Override
    public DashboardSummaryResponse getDashboardSummary(LocalDate date) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        LocalDateTime startOfDay = targetDate.atStartOfDay();
        LocalDateTime endOfDay = targetDate.atTime(LocalTime.MAX);

        List<Bill> paidBills = billRepository.findPaidBillsBetween(startOfDay, endOfDay);

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal cashTotal = BigDecimal.ZERO;
        BigDecimal upiTotal = BigDecimal.ZERO;
        BigDecimal cardTotal = BigDecimal.ZERO;

        for (Bill bill : paidBills) {
            if (bill.getFinalAmount() != null) {
                totalRevenue = totalRevenue.add(bill.getFinalAmount());
            }
            if (bill.getPayments() != null) {
                for (Payment payment : bill.getPayments()) {
                    if (payment.getAmount() == null) continue;
                    switch (payment.getPaymentMethod()) {
                        case CASH -> cashTotal = cashTotal.add(payment.getAmount());
                        case UPI -> upiTotal = upiTotal.add(payment.getAmount());
                        case CARD -> cardTotal = cardTotal.add(payment.getAmount());
                    }
                }
            }
        }

        long totalOrdersCount = paidBills.size();
        long cancelledOrdersCount = orderRepository.countByStatusAndCreatedAtBetween(OrderStatus.CANCELLED, startOfDay, endOfDay);
        long openOrdersCount = orderRepository.countByStatus(OrderStatus.OPEN);

        // Top Selling Items
        List<Object[]> rawItemSales = orderItemRepository.getItemSalesBetween(startOfDay, endOfDay);
        List<TopItemDto> topSellingItems = rawItemSales.stream()
                .map(this::mapToTopItemDto)
                .toList();

        TopItemDto topItem = !topSellingItems.isEmpty() ? topSellingItems.get(0) : null;
        List<TopItemDto> top5 = topSellingItems.stream().limit(5).toList();

        // 7-day trend
        List<DailySalesDto> recentSales = getDailySales(targetDate.minusDays(6), targetDate);

        return new DashboardSummaryResponse(
                targetDate,
                totalRevenue.setScale(2, RoundingMode.HALF_UP),
                totalOrdersCount,
                cashTotal.setScale(2, RoundingMode.HALF_UP),
                upiTotal.setScale(2, RoundingMode.HALF_UP),
                cardTotal.setScale(2, RoundingMode.HALF_UP),
                cancelledOrdersCount,
                openOrdersCount,
                topItem,
                top5,
                recentSales
        );
    }

    @Override
    public List<DailySalesDto> getDailySales(LocalDate startDate, LocalDate endDate) {
        LocalDate start = (startDate != null) ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = (endDate != null) ? endDate : LocalDate.now();

        if (start.isAfter(end)) {
            LocalDate temp = start;
            start = end;
            end = temp;
        }

        LocalDateTime startDt = start.atStartOfDay();
        LocalDateTime endDt = end.atTime(LocalTime.MAX);

        List<Bill> bills = billRepository.findPaidBillsBetween(startDt, endDt);

        Map<LocalDate, List<Bill>> billsByDate = bills.stream()
                .filter(b -> b.getPaidAt() != null)
                .collect(Collectors.groupingBy(b -> b.getPaidAt().toLocalDate()));

        List<DailySalesDto> result = new ArrayList<>();
        LocalDate cur = end;
        while (!cur.isBefore(start)) {
            List<Bill> dayBills = billsByDate.getOrDefault(cur, Collections.emptyList());

            BigDecimal dayRevenue = BigDecimal.ZERO;
            BigDecimal dayCash = BigDecimal.ZERO;
            BigDecimal dayUpi = BigDecimal.ZERO;
            BigDecimal dayCard = BigDecimal.ZERO;

            for (Bill bill : dayBills) {
                if (bill.getFinalAmount() != null) {
                    dayRevenue = dayRevenue.add(bill.getFinalAmount());
                }
                if (bill.getPayments() != null) {
                    for (Payment p : bill.getPayments()) {
                        if (p.getAmount() == null) continue;
                        switch (p.getPaymentMethod()) {
                            case CASH -> dayCash = dayCash.add(p.getAmount());
                            case UPI -> dayUpi = dayUpi.add(p.getAmount());
                            case CARD -> dayCard = dayCard.add(p.getAmount());
                        }
                    }
                }
            }

            result.add(new DailySalesDto(
                    cur,
                    dayRevenue.setScale(2, RoundingMode.HALF_UP),
                    dayBills.size(),
                    dayCash.setScale(2, RoundingMode.HALF_UP),
                    dayUpi.setScale(2, RoundingMode.HALF_UP),
                    dayCard.setScale(2, RoundingMode.HALF_UP)
            ));

            cur = cur.minusDays(1);
        }

        return result;
    }

    @Override
    public List<ItemSalesDto> getItemWiseSales(LocalDate startDate, LocalDate endDate) {
        LocalDate start = (startDate != null) ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = (endDate != null) ? endDate : LocalDate.now();

        LocalDateTime startDt = start.atStartOfDay();
        LocalDateTime endDt = end.atTime(LocalTime.MAX);

        List<Object[]> rawSales = orderItemRepository.getItemSalesBetween(startDt, endDt);
        return rawSales.stream()
                .map(row -> new ItemSalesDto(
                        (Long) row[0],
                        (String) row[1],
                        (String) row[2],
                        row[3] != null ? ((Number) row[3]).longValue() : 0L,
                        row[4] != null ? ((BigDecimal) row[4]).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO
                ))
                .toList();
    }

    @Override
    public List<MonthlySalesDto> getMonthlySales(int year) {
        int targetYear = (year > 2000) ? year : LocalDate.now().getYear();
        LocalDateTime startDt = LocalDate.of(targetYear, 1, 1).atStartOfDay();
        LocalDateTime endDt = LocalDate.of(targetYear, 12, 31).atTime(LocalTime.MAX);

        List<Bill> bills = billRepository.findPaidBillsBetween(startDt, endDt);

        Map<Integer, List<Bill>> billsByMonth = bills.stream()
                .filter(b -> b.getPaidAt() != null)
                .collect(Collectors.groupingBy(b -> b.getPaidAt().getMonthValue()));

        List<MonthlySalesDto> list = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            List<Bill> monthBills = billsByMonth.getOrDefault(month, Collections.emptyList());
            BigDecimal rev = monthBills.stream()
                    .map(Bill::getFinalAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String monthName = Month.of(month).getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            list.add(new MonthlySalesDto(
                    targetYear,
                    month,
                    monthName,
                    rev.setScale(2, RoundingMode.HALF_UP),
                    monthBills.size()
            ));
        }

        return list;
    }

    private TopItemDto mapToTopItemDto(Object[] row) {
        Long menuItemId = (Long) row[0];
        String itemName = (String) row[1];
        String categoryName = (String) row[2];
        long quantity = row[3] != null ? ((Number) row[3]).longValue() : 0L;
        BigDecimal revenue = row[4] != null ? ((BigDecimal) row[4]).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        return new TopItemDto(menuItemId, itemName, categoryName, quantity, revenue);
    }
}
