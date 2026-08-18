package com.example.autoevaluation.service;

import com.example.autoevaluation.dto.VideoRequest;
import com.example.autoevaluation.entity.autoeval.TrackedVideo;
import com.example.autoevaluation.entity.csm.CsmMedia;
import com.example.autoevaluation.repository.autoeval.TrackedVideoRepository;
import com.example.autoevaluation.repository.csm.CsmMediaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AutoEvaluationService {

    private final TrackedVideoRepository trackedVideoRepository;
    private final CsmMediaRepository csmMediaRepository;

    public TrackedVideo addVideoToTrack(VideoRequest request) {
        Optional<TrackedVideo> existing = trackedVideoRepository.findByCsmIdAndPeId(request.getCsmId(), request.getPeId());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Video này đã có trong danh sách theo dõi!");
        }

        TrackedVideo video = new TrackedVideo();
        video.setCsmId(request.getCsmId());
        video.setPeId(request.getPeId());
        video.setConvertPriority(request.getConvertPriority());
        video.setTrackingStatus("pending");
        video = trackedVideoRepository.save(video);
        return populateVideoName(video);
    }

    public List<TrackedVideo> getAllTrackedVideos() {
        List<TrackedVideo> videos = trackedVideoRepository.findAll();
        videos.forEach(this::populateVideoName);
        return videos;
    }

    @Transactional("csmTransactionManager")
    public TrackedVideo triggerEncode(Long id, Integer priority) {
        Optional<TrackedVideo> videoOpt = trackedVideoRepository.findById(id);
        if (videoOpt.isEmpty()) {
            throw new RuntimeException("Tracked video not found");
        }
        
        TrackedVideo trackedVideo = videoOpt.get();
        Long csmVideoId = trackedVideo.getCsmId();
        
        // Update priority if provided
        if (priority != null) {
            trackedVideo.setConvertPriority(priority);
        }

        // Update CSM DB
        Optional<CsmMedia> csmMediaOpt = csmMediaRepository.findById(csmVideoId);
        if (csmMediaOpt.isPresent()) {
            CsmMedia media = csmMediaOpt.get();
            media.setConvertStatus(100);
            media.setStatus(5);
            media.setConvertPriority(trackedVideo.getConvertPriority() != null ? trackedVideo.getConvertPriority() : 10000);
            csmMediaRepository.save(media);
        } else {
            throw new RuntimeException("Video not found in CSM DB");
        }

        // Update TrackedVideo status
        trackedVideo.setTrackingStatus("encoding");
        trackedVideo.setScore(null);
        trackedVideo = trackedVideoRepository.save(trackedVideo);
        return populateVideoName(trackedVideo);
    }

    private TrackedVideo populateVideoName(TrackedVideo video) {
        csmMediaRepository.findById(video.getCsmId()).ifPresent(csmMedia -> {
            video.setVideoName(csmMedia.getName());
        });
        return video;
    }
}
