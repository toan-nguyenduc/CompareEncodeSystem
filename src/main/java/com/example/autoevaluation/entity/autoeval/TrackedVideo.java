package com.example.autoevaluation.entity.autoeval;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "tracked_videos")
@Data
public class TrackedVideo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "csm_id", nullable = false)
    private Long csmId;

    @Column(name = "pe_id", nullable = false)
    private Long peId;

    @Column(name = "convert_priority")
    private Integer convertPriority;

    @Column(name = "tracking_status")
    private String trackingStatus; // e.g., "pending", "encoding", "evaluating", "completed", "failed"

    @Column(name = "score")
    private Integer score;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Transient
    private String videoName;

    @JsonProperty("evaluationResult")
    public String getEvaluationResult() {
        if (score == null) return null;
        return score >= 85 ? "PASS" : "FAIL";
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (trackingStatus == null) {
            trackingStatus = "pending";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
