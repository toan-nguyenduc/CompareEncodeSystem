package com.example.autoevaluation.dto;

import lombok.Data;

@Data
public class VideoRequest {
    private Long csmId;
    private Long peId;
    private Integer convertPriority;
}
