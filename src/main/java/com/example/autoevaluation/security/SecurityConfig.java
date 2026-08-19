package com.example.autoevaluation.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public org.springframework.boot.CommandLineRunner initAdminUser(com.example.autoevaluation.repository.autoeval.UserRepository userRepository) {
        return args -> {
            com.example.autoevaluation.entity.autoeval.AppUser admin = userRepository.findByUsername("admin").orElse(null);
            if (admin == null) {
                admin = new com.example.autoevaluation.entity.autoeval.AppUser();
                admin.setUsername("admin");
                admin.setRole("ROLE_ADMIN");
            }
            // Luôn ghi đè lại mật khẩu bằng mã hóa chuẩn của Spring Boot hiện tại
            admin.setPassword(passwordEncoder().encode("123456"));
            userRepository.save(admin);
        };
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for simplicity with API/WebSockets for now
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/login.html", "/style.css").permitAll() // Allow login page assets
                .requestMatchers("/api/mock-evaluate").permitAll() // Cho phép Job gọi API nội bộ không cần đăng nhập
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login.html")
                .loginProcessingUrl("/login")
                .defaultSuccessUrl("/index.html", true)
                .failureUrl("/login.html?error=true")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login.html?logout=true")
                .permitAll()
            );
        
        return http.build();
    }
}
