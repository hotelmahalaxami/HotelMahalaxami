package com.mahalaxmi.pos.billing.service;

import com.mahalaxmi.pos.billing.dto.BillResponse;
import com.mahalaxmi.pos.billing.dto.GenerateBillRequest;
import com.mahalaxmi.pos.billing.dto.SettleBillRequest;
import com.mahalaxmi.pos.billing.entity.BillStatus;

import java.util.List;

public interface BillingService {
    BillResponse generateBillForOrder(Long orderId, GenerateBillRequest request, String username);
    BillResponse settleBill(Long billId, SettleBillRequest request, String username);
    BillResponse getBillById(Long billId);
    BillResponse getBillByOrderId(Long orderId);
    List<BillResponse> getBills(BillStatus status);
}
