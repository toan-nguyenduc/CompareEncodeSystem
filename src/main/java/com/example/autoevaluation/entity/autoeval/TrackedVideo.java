package com.example.autoevaluation.entity.autoeval;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "tracked_videos")
@Data
@EntityListeners(AuditingEntityListener.class)
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

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "video_name")
    private String videoName;

    @org.hibernate.annotations.Formula("(SELECT COUNT(*) FROM tracked_video_history h WHERE h.tracked_video_id = id)")
    private int historyCount;

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
