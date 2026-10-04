package com.mahalaxmi.pos.auth.dto;

import com.mahalaxmi.pos.user.dto.UserResponse;

public record LoginResponse(
    String accessToken,
    String tokenType,
    long expiresIn,
    UserResponse user
) {}
