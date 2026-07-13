package com.hirehub.repository;

import com.hirehub.entity.UserExperience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserExperienceRepository extends JpaRepository<UserExperience, Long> {
    List<UserExperience> findByUserIdOrderByStartDateDesc(Long userId);
    List<UserExperience> findByUserEmailOrderByStartDateDesc(String email);
}
