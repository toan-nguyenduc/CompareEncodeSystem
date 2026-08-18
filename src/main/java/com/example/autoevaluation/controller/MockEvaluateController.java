package com.example.autoevaluation.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/mock-evaluate")
public class MockEvaluateController {

    @PostMapping
    public ResponseEntity<Map<String, Object>> evaluateVideo(@RequestBody Map<String, Object> request) {
        // Lấy ID từ request (dù không thực sự dùng tới để chấm điểm)
        Object peId = request.get("id");
        System.out.println("Mock AI Service received request to evaluate PE ID: " + peId);

        try {
            // Cố tình delay 3 giây để Frontend kịp hiển thị trạng thái "Evaluating..."
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        // Random điểm số từ 70 đến 100
        int randomScore = new Random().nextInt(31) + 70;

        // Trả về JSON giống hệ thống thật
        return ResponseEntity.ok(Map.of("score", randomScore));
    }
}
