package com.example.autoevaluation.dto;

import lombok.Data;

@Data
public class VideoRequest {
    private Long peId;
    private Integer convertPriority = 10000;
}
