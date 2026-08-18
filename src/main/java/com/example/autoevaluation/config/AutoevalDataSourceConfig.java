package com.example.autoevaluation.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
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
        entityManagerFactoryRef = "autoevalEntityManagerFactory",
        transactionManagerRef = "autoevalTransactionManager",
        basePackages = {"com.example.autoevaluation.repository.autoeval"}
)
public class AutoevalDataSourceConfig {

    @Primary
    @Bean(name = "autoevalDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.autoeval")
    public DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }

    @Primary
    @Bean(name = "autoevalEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("autoevalDataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                .packages("com.example.autoevaluation.entity.autoeval")
                .persistenceUnit("autoeval")
                .build();
    }

    @Primary
    @Bean(name = "autoevalTransactionManager")
    public PlatformTransactionManager transactionManager(
            @Qualifier("autoevalEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}
