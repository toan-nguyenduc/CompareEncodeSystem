package com.example.autoevaluation.service;

import com.example.autoevaluation.dto.VideoRequest;
import com.example.autoevaluation.entity.autoeval.TrackedVideo;
import com.example.autoevaluation.entity.csm.CsmMedia;
import com.example.autoevaluation.repository.autoeval.TrackedVideoRepository;
import com.example.autoevaluation.repository.csm.CsmMediaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AutoEvaluationService {

    private final TrackedVideoRepository trackedVideoRepository;
    private final CsmMediaRepository csmMediaRepository;
    private final com.example.autoevaluation.repository.pe.VideoRepository peVideoRepository;

    public TrackedVideo addVideoToTrack(VideoRequest request) {
        // Tự động tra cứu csm_media_id từ PE DB
        com.example.autoevaluation.entity.pe.Video peVideo = peVideoRepository.findById(request.getPeId())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Video (PE ID = " + request.getPeId() + ") trong hệ thống PE!"));
            
        Long resolvedCsmId = peVideo.getCsmMediaId();
        if (resolvedCsmId == null) {
            throw new IllegalArgumentException("Video PE này không có liên kết csm_media_id hợp lệ!");
        }

        Optional<TrackedVideo> existing = trackedVideoRepository.findByCsmIdAndPeId(resolvedCsmId, request.getPeId());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Video này đã có trong danh sách theo dõi!");
        }

        TrackedVideo video = new TrackedVideo();
        video.setCsmId(resolvedCsmId);
        video.setPeId(request.getPeId());
        video.setConvertPriority(request.getConvertPriority());
        video.setTrackingStatus("pending");
        
        try {
            csmMediaRepository.findById(resolvedCsmId).ifPresent(csmMedia -> {
                video.setVideoName(csmMedia.getName());
            });
        } catch (Exception e) {
            log.warn("Lỗi kết nối CSM DB khi lấy tên video: {}", e.getMessage());
        }

        return trackedVideoRepository.save(video);
    }

    public org.springframework.data.domain.Page<TrackedVideo> getTrackedVideos(String keyword, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "updatedAt"));
        return trackedVideoRepository.searchByKeyword(keyword, pageable);
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
        return trackedVideoRepository.save(trackedVideo);
    }
}
