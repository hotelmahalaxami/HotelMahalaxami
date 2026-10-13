package com.mahalaxmi.pos.billing.dto;

import com.mahalaxmi.pos.billing.entity.Bill;
import com.mahalaxmi.pos.billing.entity.BillStatus;
import com.mahalaxmi.pos.order.dto.OrderItemResponse;
import com.mahalaxmi.pos.order.entity.OrderType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

public record BillResponse(
        Long id,
        String billNumber,
        Long orderId,
        String orderNumber,
        String tableNumber,
        OrderType orderType,
        BigDecimal subtotal,
        BigDecimal discountAmount,
        BigDecimal taxAmount,
        BigDecimal finalAmount,
        BillStatus status,
        String notes,
        String createdByUsername,
        List<OrderItemResponse> items,
        List<PaymentResponse> payments,
        LocalDateTime paidAt,
        LocalDateTime createdAt
) {
    public static BillResponse from(Bill bill) {
        if (bill == null) return null;

        List<OrderItemResponse> itemResponses = (bill.getOrder() != null && bill.getOrder().getItems() != null)
                ? bill.getOrder().getItems().stream().map(OrderItemResponse::from).toList()
                : Collections.emptyList();

        List<PaymentResponse> paymentResponses = (bill.getPayments() != null)
                ? bill.getPayments().stream().map(PaymentResponse::from).toList()
                : Collections.emptyList();

        return new BillResponse(
                bill.getId(),
                bill.getBillNumber(),
                bill.getOrder() != null ? bill.getOrder().getId() : null,
                bill.getOrder() != null ? bill.getOrder().getOrderNumber() : null,
                bill.getOrder() != null ? bill.getOrder().getTableNumber() : null,
                bill.getOrder() != null ? bill.getOrder().getOrderType() : null,
                bill.getSubtotal(),
                bill.getDiscountAmount(),
                bill.getTaxAmount(),
                bill.getFinalAmount(),
                bill.getStatus(),
                bill.getNotes(),
                bill.getCreatedBy() != null ? bill.getCreatedBy().getUsername() : null,
                itemResponses,
                paymentResponses,
                bill.getPaidAt(),
                bill.getCreatedAt()
        );
    }
}
