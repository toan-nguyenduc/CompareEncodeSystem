package com.example.autoevaluation.audit;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Slf4j
public class RequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        long startTime = System.currentTimeMillis();
        
        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            String username = "anonymous";
            
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && !authentication.getPrincipal().equals("anonymousUser")) {
                username = authentication.getName();
            }

            // Chỉ log các request gọi vào API để tránh rác log (bỏ qua trang HTML, file tĩnh, websockets)
            String uri = request.getRequestURI();
            if (uri.startsWith("/api")) {
                log.info("Request [{}] {} - User: {} - Status: {} - {}ms", 
                    request.getMethod(), uri, username, response.getStatus(), duration);
            }
        }
    }
}
