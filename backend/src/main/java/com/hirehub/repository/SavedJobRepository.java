package com.hirehub.repository;

import com.hirehub.entity.SavedJob;
import com.hirehub.entity.SavedJobId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, SavedJobId> {
    List<SavedJob> findByUserId(Long userId);
    List<SavedJob> findByUserEmail(String email);
    boolean existsByUserIdAndJobId(Long userId, Long jobId);
    void deleteByUserIdAndJobId(Long userId, Long jobId);
    Optional<SavedJob> findByUserIdAndJobId(Long userId, Long jobId);
}
