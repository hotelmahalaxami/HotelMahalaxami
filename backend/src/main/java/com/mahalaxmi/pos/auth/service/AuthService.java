package com.mahalaxmi.pos.auth.service;

import com.mahalaxmi.pos.auth.dto.LoginRequest;
import com.mahalaxmi.pos.auth.dto.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
}
