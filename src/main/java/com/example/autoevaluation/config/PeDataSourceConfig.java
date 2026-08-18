package com.example.autoevaluation.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import jakarta.persistence.EntityManagerFactory;
import javax.sql.DataSource;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
        entityManagerFactoryRef = "peEntityManagerFactory",
        transactionManagerRef = "peTransactionManager",
        basePackages = {"com.example.autoevaluation.repository.pe"}
)
public class PeDataSourceConfig {

    @Bean(name = "peDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.pe")
    public DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "peEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("peDataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                .packages("com.example.autoevaluation.entity.pe")
                .persistenceUnit("pe")
                .build();
    }

    @Bean(name = "peTransactionManager")
    public PlatformTransactionManager transactionManager(
            @Qualifier("peEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}
