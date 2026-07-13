package com.hirehub.service;

import com.hirehub.entity.Job;
import java.util.List;

public interface JobService {
    Job createJob(Job job, String recruiterEmail);
    Job updateJob(Long jobId, Job jobDetails, String recruiterEmail);
    void deleteJob(Long jobId, String recruiterEmail);
    List<Job> getAllJobs();
    List<Job> getOpenJobs();
    List<Job> getJobsByRecruiter(String recruiterEmail);
    Job getJobById(Long jobId);
    List<Job> searchJobs(String title, String location, String jobType);
}
