package com.example.autoevaluation.entity.pe;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "video")
@Data
public class Video {
    
    @Id
    private Long id;
    
    @Column(name = "modified_at")
    private LocalDateTime modifiedAt;

    @Column(name = "csm_media_id")
    private Long csmMediaId;

    @Column(name = "title")
    private String title;

    @Column(name = "convert_end_time")
    private LocalDateTime convertEndTime;

    // Optional: add other fields if needed
}
