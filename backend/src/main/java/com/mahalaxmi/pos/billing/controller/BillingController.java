package com.mahalaxmi.pos.billing.controller;

import com.mahalaxmi.pos.billing.dto.BillResponse;
import com.mahalaxmi.pos.billing.dto.GenerateBillRequest;
import com.mahalaxmi.pos.billing.dto.SettleBillRequest;
import com.mahalaxmi.pos.billing.entity.BillStatus;
import com.mahalaxmi.pos.billing.service.BillingService;
import com.mahalaxmi.pos.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bills")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @PostMapping("/generate/{orderId}")
    public ResponseEntity<ApiResponse<BillResponse>> generateBill(
            @PathVariable Long orderId,
            @RequestBody(required = false) GenerateBillRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : null;
        BillResponse response = billingService.generateBillForOrder(orderId, request, username);
        return ResponseEntity.ok(ApiResponse.ok(response, "Bill generated successfully"));
    }

    @PostMapping("/{billId}/settle")
    public ResponseEntity<ApiResponse<BillResponse>> settleBill(
            @PathVariable Long billId,
            @Valid @RequestBody SettleBillRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : null;
        BillResponse response = billingService.settleBill(billId, request, username);
        return ResponseEntity.ok(ApiResponse.ok(response, "Bill settled and order completed successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BillResponse>> getBillById(@PathVariable Long id) {
        BillResponse response = billingService.getBillById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/by-order/{orderId}")
    public ResponseEntity<ApiResponse<BillResponse>> getBillByOrderId(@PathVariable Long orderId) {
        BillResponse response = billingService.getBillByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BillResponse>>> getBills(
            @RequestParam(required = false) BillStatus status
    ) {
        List<BillResponse> bills = billingService.getBills(status);
        return ResponseEntity.ok(ApiResponse.ok(bills));
    }
}
