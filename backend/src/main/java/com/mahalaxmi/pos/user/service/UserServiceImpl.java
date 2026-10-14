package com.mahalaxmi.pos.user.service;

import com.mahalaxmi.pos.common.exception.DuplicateResourceException;
import com.mahalaxmi.pos.common.exception.ResourceNotFoundException;
import com.mahalaxmi.pos.user.dto.CreateStaffRequest;
import com.mahalaxmi.pos.user.dto.ResetPasswordRequest;
import com.mahalaxmi.pos.user.dto.UpdateStaffRequest;
import com.mahalaxmi.pos.user.dto.UserResponse;
import com.mahalaxmi.pos.user.entity.User;
import com.mahalaxmi.pos.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserResponse findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserResponse.from(user);
    }

    @Override
    public UserResponse findByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return UserResponse.from(user);
    }

    @Override
    public List<UserResponse> getAllStaff() {
        return userRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public UserResponse createStaff(CreateStaffRequest request) {
        String username = request.username().trim();
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByUsername(username)) {
            throw new DuplicateResourceException("Username '" + username + "' is already taken");
        }
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email '" + email + "' is already registered");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setEnabled(true);

        User saved = userRepository.save(user);
        log.info("Created new staff user: {} with role: {}", saved.getUsername(), saved.getRole());
        return UserResponse.from(saved);
    }

    @Override
    @Transactional
    public UserResponse updateStaff(Long id, UpdateStaffRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (request.email() != null && !request.email().isBlank()) {
            String newEmail = request.email().trim().toLowerCase();
            if (!user.getEmail().equalsIgnoreCase(newEmail) && userRepository.existsByEmail(newEmail)) {
                throw new DuplicateResourceException("Email '" + newEmail + "' is already registered to another user");
            }
            user.setEmail(newEmail);
        }

        if (request.role() != null) {
            user.setRole(request.role());
        }

        if (request.enabled() != null) {
            user.setEnabled(request.enabled());
        }

        User saved = userRepository.save(user);
        log.info("Updated staff user: {} (Role: {}, Enabled: {})", saved.getUsername(), saved.getRole(), saved.isEnabled());
        return UserResponse.from(saved);
    }

    @Override
    @Transactional
    public UserResponse toggleStaffStatus(Long id, Boolean enabled) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        boolean newStatus = (enabled != null) ? enabled : !user.isEnabled();
        user.setEnabled(newStatus);

        User saved = userRepository.save(user);
        log.info("Toggled staff status for user: {} -> Enabled: {}", saved.getUsername(), saved.isEnabled());
        return UserResponse.from(saved);
    }

    @Override
    @Transactional
    public void resetStaffPassword(Long id, ResetPasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        log.info("Reset password for user: {}", user.getUsername());
    }
}
