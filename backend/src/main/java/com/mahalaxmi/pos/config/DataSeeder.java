package com.mahalaxmi.pos.config;

import com.mahalaxmi.pos.user.entity.Role;
import com.mahalaxmi.pos.user.entity.User;
import com.mahalaxmi.pos.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("!prod")
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${DEV_SEED:false}")
    private boolean devSeed;

    @Value("${DEV_ADMIN_PASSWORD:Admin@123}")
    private String adminPassword;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!devSeed) {
            return;
        }

        if (!userRepository.existsByUsername("admin")) {
            User admin = new User(
                    "admin",
                    "admin@mahalaxmi.com",
                    passwordEncoder.encode(adminPassword),
                    Role.ADMIN,
                    true
            );
            userRepository.save(admin);
            log.info("[DEV] Created default admin user. CHANGE PASSWORD IN PRODUCTION.");
        }
    }
}
