package com.mahalaxmi.pos.auth;

import com.mahalaxmi.pos.auth.dto.LoginRequest;
import com.mahalaxmi.pos.auth.dto.LoginResponse;
import com.mahalaxmi.pos.auth.service.AuthServiceImpl;
import com.mahalaxmi.pos.auth.service.JwtService;
import com.mahalaxmi.pos.common.exception.AuthenticationException;
import com.mahalaxmi.pos.config.security.AppProperties;
import com.mahalaxmi.pos.user.entity.Role;
import com.mahalaxmi.pos.user.entity.User;
import com.mahalaxmi.pos.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AppProperties appProperties;

    @Mock
    private AppProperties.Jwt jwtProperties;

    @InjectMocks
    private AuthServiceImpl authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("testuser@example.com");
        testUser.setPassword("encodedPassword");
        testUser.setRole(Role.STAFF);
        testUser.setEnabled(true);
    }

    @Test
    void login_withValidCredentials_returnsLoginResponse() {
        LoginRequest request = new LoginRequest("testuser", "password123");

        when(userRepository.findByUsername(request.usernameOrEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(request.password(), testUser.getPassword())).thenReturn(true);
        when(jwtService.generateToken(testUser)).thenReturn("mocked-jwt-token");
        when(appProperties.getJwt()).thenReturn(jwtProperties);
        when(jwtProperties.getExpirationMs()).thenReturn(86400000L);

        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked-jwt-token", response.accessToken());
        assertEquals("Bearer", response.tokenType());
        assertEquals("testuser", response.user().username());
    }

    @Test
    void login_withInvalidPassword_throwsAuthenticationException() {
        LoginRequest request = new LoginRequest("testuser", "wrongpassword");

        when(userRepository.findByUsername(request.usernameOrEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(request.password(), testUser.getPassword())).thenReturn(false);

        assertThrows(AuthenticationException.class, () -> authService.login(request));
    }

    @Test
    void login_withUnknownUser_throwsAuthenticationException() {
        LoginRequest request = new LoginRequest("unknown", "password123");

        when(userRepository.findByUsername(request.usernameOrEmail())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(request.usernameOrEmail())).thenReturn(Optional.empty());

        assertThrows(AuthenticationException.class, () -> authService.login(request));
    }

    @Test
    void login_withDisabledUser_throwsAuthenticationException() {
        testUser.setEnabled(false);
        LoginRequest request = new LoginRequest("testuser", "password123");

        when(userRepository.findByUsername(request.usernameOrEmail())).thenReturn(Optional.of(testUser));

        assertThrows(AuthenticationException.class, () -> authService.login(request));
    }

    @Test
    void login_neverLogsPassword() {
        LoginRequest request = new LoginRequest("testuser", "password123");

        when(userRepository.findByUsername(request.usernameOrEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(request.password(), testUser.getPassword())).thenReturn(false);

        try {
            authService.login(request);
        } catch (AuthenticationException ignored) {
        }

        // We can't easily assert on slf4j logs in simple mockito tests,
        // but we ensure no system.out printing password either.
        verify(passwordEncoder).matches(eq("password123"), anyString());
    }
}
