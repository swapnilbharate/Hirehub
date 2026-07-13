package com.hirehub.repository;

import com.hirehub.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByApplicationUserId(Long userId);
    List<Interview> findByApplicationUserEmail(String email);
    List<Interview> findByApplicationJobRecruiterUserId(Long recruiterUserId);
    List<Interview> findByApplicationJobRecruiterUserEmail(String email);
}
