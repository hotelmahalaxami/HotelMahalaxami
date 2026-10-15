package com.mahalaxmi.pos.order.controller;

import com.mahalaxmi.pos.common.response.ApiResponse;
import com.mahalaxmi.pos.order.dto.OrderResponse;
import com.mahalaxmi.pos.order.entity.AcceptanceStatus;
import com.mahalaxmi.pos.order.service.WebsiteOrderManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders/website")
public class WebsiteOrderManagementController {

    private final WebsiteOrderManagementService websiteOrderManagementService;

    public WebsiteOrderManagementController(WebsiteOrderManagementService websiteOrderManagementService) {
        this.websiteOrderManagementService = websiteOrderManagementService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getWebsiteOrders(
            @RequestParam(required = false, defaultValue = "PENDING") AcceptanceStatus status
    ) {
        List<OrderResponse> orders = websiteOrderManagementService.getWebsiteOrders(status);
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @GetMapping("/pending-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getPendingCount() {
        long count = websiteOrderManagementService.getPendingWebsiteOrderCount();
        return ResponseEntity.ok(ApiResponse.ok(Map.of("pendingCount", count)));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<OrderResponse>> acceptOrder(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : null;
        OrderResponse response = websiteOrderManagementService.acceptWebsiteOrder(id, username);
        return ResponseEntity.ok(ApiResponse.ok(response, "Website order accepted successfully"));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<OrderResponse>> rejectOrder(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : null;
        String reason = (body != null) ? body.get("reason") : null;
        OrderResponse response = websiteOrderManagementService.rejectWebsiteOrder(id, reason, username);
        return ResponseEntity.ok(ApiResponse.ok(response, "Website order rejected"));
    }
}
