package com.example.autoevaluation.repository.autoeval;

import com.example.autoevaluation.entity.autoeval.TrackedVideoHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrackedVideoHistoryRepository extends JpaRepository<TrackedVideoHistory, Long> {
    List<TrackedVideoHistory> findByTrackedVideoIdOrderByRunAtDesc(Long trackedVideoId);
}
