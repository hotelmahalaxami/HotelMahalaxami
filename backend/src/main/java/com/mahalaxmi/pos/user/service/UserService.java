package com.mahalaxmi.pos.user.service;

import com.mahalaxmi.pos.user.dto.CreateStaffRequest;
import com.mahalaxmi.pos.user.dto.ResetPasswordRequest;
import com.mahalaxmi.pos.user.dto.UpdateStaffRequest;
import com.mahalaxmi.pos.user.dto.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse findById(Long id);
    UserResponse findByUsername(String username);

    // Admin Staff Management
    List<UserResponse> getAllStaff();
    UserResponse createStaff(CreateStaffRequest request);
    UserResponse updateStaff(Long id, UpdateStaffRequest request);
    UserResponse toggleStaffStatus(Long id, Boolean enabled);
    void resetStaffPassword(Long id, ResetPasswordRequest request);
}
