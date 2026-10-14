package com.mahalaxmi.pos.common.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@Tag(name = "Health Check", description = "Endpoints for uptime monitoring and service health")
public class HealthCheckController {

    @Operation(summary = "Health check endpoint", description = "Public health check endpoint for UptimeRobot, Render wake-up, and monitoring")
    @GetMapping({"/health", "/api/health", "/api/v1/health", "/"})
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("service", "Hotel Mahalaxmi POS Backend");
        response.put("message", "Service is healthy and awake");
        response.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(response);
    }
}
