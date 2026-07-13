package com.hirehub.repository;

import com.hirehub.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByUserId(Long userId);
    List<Application> findByUserEmail(String email);
    List<Application> findByJobId(Long jobId);
    List<Application> findByJobRecruiterUserEmail(String email);
    boolean existsByJobIdAndUserId(Long jobId, Long userId);
}
