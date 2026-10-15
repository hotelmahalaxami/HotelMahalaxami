package com.mahalaxmi.pos.order.controller;

import com.mahalaxmi.pos.common.response.ApiResponse;
import com.mahalaxmi.pos.order.dto.PublicOrderSubmissionRequest;
import com.mahalaxmi.pos.order.dto.PublicOrderSubmissionResponse;
import com.mahalaxmi.pos.order.dto.PublicOrderTrackingResponse;
import com.mahalaxmi.pos.order.service.PublicOrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/orders")
public class PublicOrderController {

    private final PublicOrderService publicOrderService;

    public PublicOrderController(PublicOrderService publicOrderService) {
        this.publicOrderService = publicOrderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PublicOrderSubmissionResponse>> submitOrder(
            @Valid @RequestBody PublicOrderSubmissionRequest request,
            HttpServletRequest httpRequest
    ) {
        String clientIp = extractClientIp(httpRequest);
        PublicOrderSubmissionResponse response = publicOrderService.submitPublicOrder(request, clientIp);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Order submitted successfully"));
    }

    @GetMapping("/track/{trackingToken}")
    public ResponseEntity<ApiResponse<PublicOrderTrackingResponse>> trackOrder(
            @PathVariable String trackingToken
    ) {
        PublicOrderTrackingResponse response = publicOrderService.trackPublicOrder(trackingToken);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
