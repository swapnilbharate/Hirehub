package com.hirehub.repository;

import com.hirehub.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUserId(Long userId);
    List<Resume> findByUserEmail(String email);
    Optional<Resume> findFirstByUserIdOrderByUploadedAtDesc(Long userId);
    Optional<Resume> findFirstByUserEmailOrderByUploadedAtDesc(String email);
}
