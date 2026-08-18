package com.example.autoevaluation.job;

import com.example.autoevaluation.entity.autoeval.TrackedVideo;
import com.example.autoevaluation.entity.autoeval.TrackedVideoHistory;
import com.example.autoevaluation.entity.pe.Video;
import com.example.autoevaluation.repository.pe.VideoRepository;
import com.example.autoevaluation.repository.autoeval.TrackedVideoHistoryRepository;
import com.example.autoevaluation.repository.autoeval.TrackedVideoRepository;
import com.example.autoevaluation.dto.EvaluationResponse;
import com.example.autoevaluation.repository.csm.CsmMediaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class EvaluationPollingJob {

    private final TrackedVideoRepository trackedVideoRepository;
    private final TrackedVideoHistoryRepository trackedVideoHistoryRepository;
    private final VideoRepository peVideoRepository;
    private final CsmMediaRepository csmMediaRepository;
    private final RestTemplate restTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${eval.service.url}")
    private String evalServiceUrl;

    @Scheduled(fixedDelayString = "${app.polling.delay}")
    public void pollEncodingStatus() {
        log.info("Running evaluation polling job...");
        List<TrackedVideo> encodingVideos = trackedVideoRepository.findByTrackingStatus("encoding");
        
        for (TrackedVideo video : encodingVideos) {
            Optional<Video> peVideoOpt = peVideoRepository.findById(video.getPeId());
            if (peVideoOpt.isPresent()) {
                Video peVideo = peVideoOpt.get();
                if (peVideo.getConvertEndTime() != null) {
                    // Encoding finished
                    video.setTrackingStatus("evaluating");
                    trackedVideoRepository.save(video);
                    
                    // Broadcast 'evaluating' status to frontend immediately
                    broadcast(video);
                    
                    evaluateVideo(video);
                }
            }
        }
    }

    private void evaluateVideo(TrackedVideo video) {
        try {
            log.info("Calling evaluation service for PE ID {}", video.getPeId());
            ResponseEntity<EvaluationResponse> response = restTemplate.postForEntity(
                evalServiceUrl,
                Map.of("id", video.getPeId()),
                EvaluationResponse.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Integer score = response.getBody().getScore();
                
                if (score != null) {
                    video.setScore(score);
                    video.setTrackingStatus("completed"); // Always completed if no error
                    trackedVideoRepository.save(video);
                    
                    // Broadcast over WebSocket
                    broadcast(video);
                    log.info("Evaluation completed. Score: {}. Broadcasted to frontend.", score);
                    
                    saveHistory(video);
                } else {
                    log.warn("Score is null in evaluation response.");
                    failVideo(video);
                }
            } else {
                log.error("Evaluation service returned non-success status.");
                failVideo(video);
            }
        } catch (Exception e) {
            log.error("Error calling evaluation service: ", e);
            failVideo(video);
        }
    }
    
    private void failVideo(TrackedVideo video) {
        video.setTrackingStatus("error");
        trackedVideoRepository.save(video);
        broadcast(video);
        saveHistory(video);
    }

    private void saveHistory(TrackedVideo video) {
        TrackedVideoHistory history = new TrackedVideoHistory();
        history.setTrackedVideoId(video.getId());
        history.setScore(video.getScore());
        history.setTrackingStatus(video.getTrackingStatus());
        history.setConvertPriority(video.getConvertPriority());
        trackedVideoHistoryRepository.save(history);
    }

    private void broadcast(TrackedVideo video) {
        csmMediaRepository.findById(video.getCsmId()).ifPresent(csm -> video.setVideoName(csm.getName()));
        messagingTemplate.convertAndSend("/topic/evaluations", video);
    }
}
