package com.mahalaxmi.pos.auth.service;

import com.mahalaxmi.pos.auth.dto.LoginRequest;
import com.mahalaxmi.pos.auth.dto.LoginResponse;
import com.mahalaxmi.pos.common.exception.AuthenticationException;
import com.mahalaxmi.pos.config.security.AppProperties;
import com.mahalaxmi.pos.user.dto.UserResponse;
import com.mahalaxmi.pos.user.entity.User;
import com.mahalaxmi.pos.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AppProperties appProperties;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder,
                           JwtService jwtService, AppProperties appProperties) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.appProperties = appProperties;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.usernameOrEmail())
                .or(() -> userRepository.findByEmail(request.usernameOrEmail()))
                .orElse(null);

        if (user == null) {
            log.warn("Login failed for unknown user: {}", request.usernameOrEmail());
            throw new AuthenticationException("Invalid credentials");
        }

        if (!user.isEnabled()) {
            log.warn("Login attempt for disabled user: {}", request.usernameOrEmail());
            throw new AuthenticationException("Account is disabled");
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            log.warn("Login failed for user: {} - Invalid password", request.usernameOrEmail());
            throw new AuthenticationException("Invalid credentials");
        }

        String token = jwtService.generateToken(user);
        
        log.info("Successful login for user: {}", user.getUsername());
        
        return new LoginResponse(
                token,
                "Bearer",
                appProperties.getJwt().getExpirationMs(),
                UserResponse.from(user)
        );
    }
}
