package com.hirehub.service.impl;

import com.hirehub.entity.Job;
import com.hirehub.entity.Recruiter;
import com.hirehub.exception.ResourceNotFoundException;
import com.hirehub.repository.JobRepository;
import com.hirehub.repository.RecruiterRepository;
import com.hirehub.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class JobServiceImpl implements JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private RecruiterRepository recruiterRepository;

    @Override
    @Transactional
    public Job createJob(Job job, String recruiterEmail) {
        Recruiter recruiter = recruiterRepository.findByUserEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found for user: " + recruiterEmail));

        job.setRecruiter(recruiter);
        job.setCompany(recruiter.getCompany());
        job.setStatus("OPEN");

        return jobRepository.save(job);
    }

    @Override
    @Transactional
    public Job updateJob(Long jobId, Job jobDetails, String recruiterEmail) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + jobId));

        // Security check: only the posting recruiter can update the job
        if (!job.getRecruiter().getUser().getEmail().equals(recruiterEmail)) {
            throw new IllegalArgumentException("You are not authorized to update this job post");
        }

        job.setTitle(jobDetails.getTitle());
        job.setDescription(jobDetails.getDescription());
        job.setRequirements(jobDetails.getRequirements());
        job.setLocation(jobDetails.getLocation());
        job.setJobType(jobDetails.getJobType());
        job.setSalaryRange(jobDetails.getSalaryRange());
        if (jobDetails.getStatus() != null) {
            job.setStatus(jobDetails.getStatus());
        }

        return jobRepository.save(job);
    }

    @Override
    @Transactional
    public void deleteJob(Long jobId, String recruiterEmail) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + jobId));

        // Security check
        if (!job.getRecruiter().getUser().getEmail().equals(recruiterEmail)) {
            throw new IllegalArgumentException("You are not authorized to delete this job post");
        }

        jobRepository.delete(job);
    }

    @Override
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    @Override
    public List<Job> getOpenJobs() {
        return jobRepository.findByStatus("OPEN");
    }

    @Override
    public List<Job> getJobsByRecruiter(String recruiterEmail) {
        return jobRepository.findByRecruiterUserEmail(recruiterEmail);
    }

    @Override
    public Job getJobById(Long jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + jobId));
    }

    @Override
    public List<Job> searchJobs(String title, String location, String jobType) {
        // Replace empty strings with null for query variables
        String titleParam = (title != null && !title.trim().isEmpty()) ? title : null;
        String locationParam = (location != null && !location.trim().isEmpty()) ? location : null;
        String jobTypeParam = (jobType != null && !jobType.trim().isEmpty() && !jobType.equalsIgnoreCase("All")) ? jobType : null;

        return jobRepository.searchJobs(titleParam, locationParam, jobTypeParam);
    }
}
