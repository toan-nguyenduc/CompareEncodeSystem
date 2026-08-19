package com.example.autoevaluation.repository.autoeval;

import com.example.autoevaluation.entity.autoeval.TrackedVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface TrackedVideoRepository extends JpaRepository<TrackedVideo, Long> {
    List<TrackedVideo> findByTrackingStatus(String trackingStatus);
    List<TrackedVideo> findByTrackingStatusIn(List<String> statuses);
    Optional<TrackedVideo> findByCsmIdAndPeId(Long csmId, Long peId);

    @Query("SELECT t FROM TrackedVideo t WHERE :keyword IS NULL OR :keyword = '' OR LOWER(t.videoName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR CAST(t.peId AS string) LIKE CONCAT('%', :keyword, '%')")
    Page<TrackedVideo> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
