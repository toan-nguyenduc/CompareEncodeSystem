package com.example.autoevaluation.service;

import com.example.autoevaluation.dto.VideoRequest;
import com.example.autoevaluation.entity.autoeval.TrackedVideo;
import com.example.autoevaluation.entity.csm.CsmMedia;
import com.example.autoevaluation.entity.pe.Video;
import com.example.autoevaluation.repository.autoeval.TrackedVideoRepository;
import com.example.autoevaluation.repository.csm.CsmMediaRepository;
import com.example.autoevaluation.repository.pe.VideoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AutoEvaluationServiceTest {

    @Mock
    private TrackedVideoRepository trackedVideoRepository;

    @Mock
    private CsmMediaRepository csmMediaRepository;

    @Mock
    private VideoRepository peVideoRepository;

    @InjectMocks
    private AutoEvaluationService autoEvaluationService;

    private VideoRequest validRequest;
    private Video mockPeVideo;
    private CsmMedia mockCsmMedia;

    @BeforeEach
    void setUp() {
        validRequest = new VideoRequest();
        validRequest.setPeId(101L);
        validRequest.setConvertPriority(1000);

        mockPeVideo = new Video();
        mockPeVideo.setId(101L);
        mockPeVideo.setCsmMediaId(1L);

        mockCsmMedia = new CsmMedia();
        mockCsmMedia.setId(1L);
        mockCsmMedia.setName("Avengers: Endgame");
    }

    @Test
    void addVideoToTrack_Success() {
        // Mock PE DB returning valid video
        when(peVideoRepository.findById(101L)).thenReturn(Optional.of(mockPeVideo));
        // Mock AutoEval DB confirming no duplicate exists
        when(trackedVideoRepository.findByCsmIdAndPeId(1L, 101L)).thenReturn(Optional.empty());
        // Mock CSM DB returning media to fetch name
        when(csmMediaRepository.findById(1L)).thenReturn(Optional.of(mockCsmMedia));
        // Mock save
        when(trackedVideoRepository.save(any(TrackedVideo.class))).thenAnswer(invocation -> {
            TrackedVideo saved = invocation.getArgument(0);
            saved.setId(10L); // simulate auto-increment
            return saved;
        });

        TrackedVideo result = autoEvaluationService.addVideoToTrack(validRequest);

        assertNotNull(result);
        assertEquals(101L, result.getPeId());
        assertEquals(1L, result.getCsmId());
        assertEquals("Avengers: Endgame", result.getVideoName());
        assertEquals("pending", result.getTrackingStatus());
        verify(trackedVideoRepository, times(1)).save(any(TrackedVideo.class));
    }

    @Test
    void addVideoToTrack_PeVideoNotFound() {
        when(peVideoRepository.findById(101L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            autoEvaluationService.addVideoToTrack(validRequest);
        });

        assertTrue(exception.getMessage().contains("Không tìm thấy Video"));
        verify(trackedVideoRepository, never()).save(any());
    }

    @Test
    void addVideoToTrack_AlreadyExists() {
        when(peVideoRepository.findById(101L)).thenReturn(Optional.of(mockPeVideo));
        when(trackedVideoRepository.findByCsmIdAndPeId(1L, 101L)).thenReturn(Optional.of(new TrackedVideo()));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            autoEvaluationService.addVideoToTrack(validRequest);
        });

        assertEquals("Video này đã có trong danh sách theo dõi!", exception.getMessage());
        verify(trackedVideoRepository, never()).save(any());
    }

    @Test
    void triggerEncode_Success() {
        TrackedVideo mockTrackedVideo = new TrackedVideo();
        mockTrackedVideo.setId(10L);
        mockTrackedVideo.setCsmId(1L);
        mockTrackedVideo.setTrackingStatus("completed");

        when(trackedVideoRepository.findById(10L)).thenReturn(Optional.of(mockTrackedVideo));
        when(csmMediaRepository.findById(1L)).thenReturn(Optional.of(mockCsmMedia));
        
        when(trackedVideoRepository.save(any(TrackedVideo.class))).thenReturn(mockTrackedVideo);

        TrackedVideo result = autoEvaluationService.triggerEncode(10L, 999);

        assertEquals(999, mockTrackedVideo.getConvertPriority());
        assertEquals(100, mockCsmMedia.getConvertStatus());
        assertEquals(5, mockCsmMedia.getStatus());
        assertEquals("encoding", result.getTrackingStatus());
        assertNull(result.getScore());

        verify(csmMediaRepository, times(1)).save(mockCsmMedia);
        verify(trackedVideoRepository, times(1)).save(mockTrackedVideo);
    }
}
