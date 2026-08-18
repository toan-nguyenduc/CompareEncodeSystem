package com.example.autoevaluation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AutoEvaluationApplication {

    public static void main(String[] args) {
        SpringApplication.run(AutoEvaluationApplication.class, args);
    }

}
