package com.mahalaxmi.pos.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayConfig {

    private static final Logger log = LoggerFactory.getLogger(FlywayConfig.class);

    @Bean
    public FlywayMigrationStrategy cleanFailedMigrationsFlywayMigrationStrategy() {
        return flyway -> {
            log.info("Running Flyway repair to clean any failed migration markers and synchronize checksums...");
            flyway.repair();
            log.info("Applying Flyway migrations...");
            flyway.migrate();
        };
    }
}
