package com.mahalaxmi.pos.user.service;

import com.mahalaxmi.pos.user.dto.UserResponse;

public interface UserService {
    UserResponse findById(Long id);
    UserResponse findByUsername(String username);
}
