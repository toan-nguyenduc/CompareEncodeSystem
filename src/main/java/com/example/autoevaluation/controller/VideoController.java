package com.example.autoevaluation.controller;

import com.example.autoevaluation.dto.VideoRequest;
import com.example.autoevaluation.entity.autoeval.TrackedVideo;
import com.example.autoevaluation.entity.autoeval.TrackedVideoHistory;
import com.example.autoevaluation.repository.autoeval.TrackedVideoHistoryRepository;
import com.example.autoevaluation.service.AutoEvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {

    private final AutoEvaluationService autoEvaluationService;
    private final TrackedVideoHistoryRepository trackedVideoHistoryRepository;

    @PostMapping
    public ResponseEntity<?> createTrackedVideo(@RequestBody VideoRequest request) {
        try {
            return ResponseEntity.ok(autoEvaluationService.addVideoToTrack(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<TrackedVideo>> getVideos() {
        return ResponseEntity.ok(autoEvaluationService.getAllTrackedVideos());
    }

    @PostMapping("/{id}/encode")
    public ResponseEntity<TrackedVideo> triggerEncode(@PathVariable Long id, @RequestParam(required = false) Integer priority) {
        return ResponseEntity.ok(autoEvaluationService.triggerEncode(id, priority));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<TrackedVideoHistory>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(trackedVideoHistoryRepository.findByTrackedVideoIdOrderByRunAtDesc(id));
    }
}
