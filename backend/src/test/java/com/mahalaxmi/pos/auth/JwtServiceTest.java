package com.mahalaxmi.pos.auth;

import com.mahalaxmi.pos.auth.service.JwtServiceImpl;
import com.mahalaxmi.pos.config.security.AppProperties;
import com.mahalaxmi.pos.user.entity.Role;
import com.mahalaxmi.pos.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtServiceImpl jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        AppProperties appProperties = new AppProperties();
        
        // Generate a valid 256-bit key (32 bytes)
        String secret = Base64.getEncoder().encodeToString("super_secret_key_that_is_long_enough_for_hmac_sha_256".getBytes());
        appProperties.getJwt().setSecret(secret);
        appProperties.getJwt().setExpirationMs(1000 * 60 * 60); // 1 hour

        jwtService = new JwtServiceImpl(appProperties);

        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setRole(Role.ADMIN);
    }

    @Test
    void generatedToken_canBeValidated() {
        String token = jwtService.generateToken(testUser);
        
        assertNotNull(token);
        assertTrue(jwtService.isTokenValid(token, testUser));
    }

    @Test
    void invalidToken_isRejected() {
        String token = jwtService.generateToken(testUser) + "invalid";
        
        assertFalse(jwtService.isTokenValid(token, testUser));
    }

    @Test
    void tokenContainsExpectedClaims() {
        String token = jwtService.generateToken(testUser);
        
        String extractedUsername = jwtService.extractUsername(token);
        
        assertEquals(testUser.getUsername(), extractedUsername);
    }
    
    @Test
    void expiredToken_isRejected() throws InterruptedException {
        AppProperties shortAppProps = new AppProperties();
        String secret = Base64.getEncoder().encodeToString("super_secret_key_that_is_long_enough_for_hmac_sha_256".getBytes());
        shortAppProps.getJwt().setSecret(secret);
        shortAppProps.getJwt().setExpirationMs(1); // 1 ms expiration
        
        JwtServiceImpl shortJwtService = new JwtServiceImpl(shortAppProps);
        String token = shortJwtService.generateToken(testUser);
        
        Thread.sleep(10); // Wait for token to expire
        
        assertFalse(shortJwtService.isTokenValid(token, testUser));
    }
}
