package com.hirehub.repository;

import com.hirehub.entity.UserEducation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserEducationRepository extends JpaRepository<UserEducation, Long> {
    List<UserEducation> findByUserIdOrderByStartYearDesc(Long userId);
    List<UserEducation> findByUserEmailOrderByStartYearDesc(String email);
}
