package com.hirehub.repository;

import com.hirehub.entity.Recruiter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RecruiterRepository extends JpaRepository<Recruiter, Long> {
    Optional<Recruiter> findByUserId(Long userId);
    Optional<Recruiter> findByUserEmail(String email);
}
