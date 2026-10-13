package com.mahalaxmi.pos.config;

import com.zaxxer.hikari.HikariDataSource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import javax.sql.DataSource;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class HikariPoolConfigurationTest {

    @Autowired
    private DataSource dataSource;

    @Test
    void dataSource_isHikariDataSource() {
        assertThat(dataSource).isInstanceOf(HikariDataSource.class);
    }

    @Test
    void hikariPool_hasConservativeConfiguration() {
        assertThat(dataSource).isInstanceOf(HikariDataSource.class);
        HikariDataSource hikariDataSource = (HikariDataSource) dataSource;

        // Verify the conservative pool limits requested for small deployments while keeping 1 warm connection
        assertThat(hikariDataSource.getMaximumPoolSize()).isEqualTo(3);
        assertThat(hikariDataSource.getMinimumIdle()).isEqualTo(1);
        assertThat(hikariDataSource.getConnectionTimeout()).isEqualTo(30000);
        assertThat(hikariDataSource.getKeepaliveTime()).isEqualTo(300000);
    }
}
