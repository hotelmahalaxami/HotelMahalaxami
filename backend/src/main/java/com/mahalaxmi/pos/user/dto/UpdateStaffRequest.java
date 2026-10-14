package com.mahalaxmi.pos.user.dto;

import com.mahalaxmi.pos.user.entity.Role;
import jakarta.validation.constraints.Email;

public record UpdateStaffRequest(
        @Email(message = "Valid email is required")
        String email,

        Role role,

        Boolean enabled
) {
}
