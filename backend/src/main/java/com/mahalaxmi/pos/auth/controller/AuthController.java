package com.mahalaxmi.pos.auth.controller;

import com.mahalaxmi.pos.auth.dto.LoginRequest;
import com.mahalaxmi.pos.auth.dto.LoginResponse;
import com.mahalaxmi.pos.auth.service.AuthService;
import com.mahalaxmi.pos.common.response.ApiResponse;
import com.mahalaxmi.pos.user.dto.UserResponse;
import com.mahalaxmi.pos.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Login successful"));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserResponse>> getMe() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        UserResponse response = userService.findByUsername(username);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
