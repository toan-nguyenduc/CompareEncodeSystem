package com.example.autoevaluation.entity.csm;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "csm_media")
@Data
public class CsmMedia {
    
    @Id
    private Long id;
    
    private String name;
    
    private Integer status;
    
    @Column(name = "convert_status")
    private Integer convertStatus;
    
    @Column(name = "convert_priority")
    private Integer convertPriority;
    
    @Column(name = "convert_end_time")
    private LocalDateTime convertEndTime;
    
}
