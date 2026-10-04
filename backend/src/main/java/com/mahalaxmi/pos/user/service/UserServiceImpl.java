package com.mahalaxmi.pos.user.service;

import com.mahalaxmi.pos.common.exception.ResourceNotFoundException;
import com.mahalaxmi.pos.user.dto.UserResponse;
import com.mahalaxmi.pos.user.entity.User;
import com.mahalaxmi.pos.user.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
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
}
