package com.mahalaxmi.pos.auth.service;

import com.mahalaxmi.pos.user.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    private final UserRepository userRepository;
    
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Try username first, then email
        return userRepository.findByUsername(username)
            .or(() -> userRepository.findByEmail(username))
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}
