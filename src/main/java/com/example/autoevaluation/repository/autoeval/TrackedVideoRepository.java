package com.example.autoevaluation.repository.autoeval;

import com.example.autoevaluation.entity.autoeval.TrackedVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrackedVideoRepository extends JpaRepository<TrackedVideo, Long> {
    List<TrackedVideo> findByTrackingStatus(String trackingStatus);
    Optional<TrackedVideo> findByCsmIdAndPeId(Long csmId, Long peId);
}
