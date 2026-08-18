package com.example.autoevaluation.repository.csm;

import com.example.autoevaluation.entity.csm.CsmMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CsmMediaRepository extends JpaRepository<CsmMedia, Long> {
}
