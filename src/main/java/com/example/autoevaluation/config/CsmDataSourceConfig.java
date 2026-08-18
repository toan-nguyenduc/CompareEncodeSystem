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
        entityManagerFactoryRef = "csmEntityManagerFactory",
        transactionManagerRef = "csmTransactionManager",
        basePackages = {"com.example.autoevaluation.repository.csm"}
)
public class CsmDataSourceConfig {

    @Bean(name = "csmDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.csm")
    public DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "csmEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("csmDataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                .packages("com.example.autoevaluation.entity.csm")
                .persistenceUnit("csm")
                .build();
    }

    @Bean(name = "csmTransactionManager")
    public PlatformTransactionManager transactionManager(
            @Qualifier("csmEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}
