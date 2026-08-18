package com.example.autoevaluation.entity.autoeval;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tracked_video_history")
@Data
public class TrackedVideoHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tracked_video_id", nullable = false)
    private Long trackedVideoId;

    @Column(name = "score")
    private Integer score;

    @Column(name = "tracking_status")
    private String trackingStatus;

    @Column(name = "convert_priority")
    private Integer convertPriority;

    @CreationTimestamp
    @Column(name = "run_at", updatable = false)
    private LocalDateTime runAt;

    @JsonProperty("evaluationResult")
    public String getEvaluationResult() {
        if (score == null) return null;
        return score >= 85 ? "PASS" : "FAIL";
    }
}
