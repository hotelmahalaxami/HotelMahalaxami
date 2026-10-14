package com.mahalaxmi.pos.user.controller;

import com.mahalaxmi.pos.common.response.ApiResponse;
import com.mahalaxmi.pos.user.dto.CreateStaffRequest;
import com.mahalaxmi.pos.user.dto.ResetPasswordRequest;
import com.mahalaxmi.pos.user.dto.UpdateStaffRequest;
import com.mahalaxmi.pos.user.dto.UserResponse;
import com.mahalaxmi.pos.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/staff")
@PreAuthorize("hasRole('ADMIN')")
public class StaffController {

    private final UserService userService;

    public StaffController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllStaff() {
        List<UserResponse> staffList = userService.getAllStaff();
        return ResponseEntity.ok(ApiResponse.ok(staffList));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createStaff(
            @Valid @RequestBody CreateStaffRequest request
    ) {
        UserResponse response = userService.createStaff(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Staff user created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateStaff(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStaffRequest request
    ) {
        UserResponse response = userService.updateStaff(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Staff user updated successfully"));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<UserResponse>> toggleStatus(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean enabled
    ) {
        UserResponse response = userService.toggleStaffStatus(id, enabled);
        return ResponseEntity.ok(ApiResponse.ok(response, "Staff user status updated"));
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        userService.resetStaffPassword(id, request);
        return ResponseEntity.ok(ApiResponse.message("Password reset successfully"));
    }
}
