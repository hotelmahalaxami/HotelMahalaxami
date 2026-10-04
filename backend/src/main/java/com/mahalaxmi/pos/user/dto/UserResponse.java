package com.mahalaxmi.pos.user.dto;

import com.mahalaxmi.pos.user.entity.Role;
import com.mahalaxmi.pos.user.entity.User;
import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String username,
        String email,
        Role role,
        boolean enabled,
        LocalDateTime createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled(),
                user.getCreatedAt()
        );
    }
}
