package com.hirehub.repository;

import com.hirehub.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByStatus(String status);
    List<Job> findByRecruiterId(Long recruiterId);
    List<Job> findByRecruiterUserEmail(String email);
    List<Job> findByCompanyIdAndStatus(Long companyId, String status);

    @Query("SELECT j FROM Job j WHERE j.status = 'OPEN' AND " +
           "(:title IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:jobType IS NULL OR j.jobType = :jobType)")
    List<Job> searchJobs(@Param("title") String title, 
                         @Param("location") String location, 
                         @Param("jobType") String jobType);
}
