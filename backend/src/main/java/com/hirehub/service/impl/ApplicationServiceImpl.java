package com.hirehub.service.impl;

import com.hirehub.entity.*;
import com.hirehub.exception.ResourceNotFoundException;
import com.hirehub.repository.*;
import com.hirehub.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ApplicationServiceImpl implements ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    @Transactional
    public Application applyJob(Long jobId, String seekerEmail, String coverLetter, Long resumeId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + jobId));

        User user = userRepository.findByEmail(seekerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + seekerEmail));

        if (applicationRepository.existsByJobIdAndUserId(jobId, user.getId())) {
            throw new IllegalArgumentException("You have already applied to this job posting.");
        }

        Resume resume = null;
        if (resumeId != null) {
            resume = resumeRepository.findById(resumeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Resume not found with ID: " + resumeId));
        } else {
            // Fallback: look for the latest user resume
            resume = resumeRepository.findFirstByUserEmailOrderByUploadedAtDesc(seekerEmail).orElse(null);
        }

        int score = calculateAtsScore(job, resume);

        Application application = new Application();
        application.setJob(job);
        application.setUser(user);
        application.setResume(resume);
        application.setCoverLetter(coverLetter);
        application.setScore(score);
        application.setStatus("APPLIED");

        Application savedApp = applicationRepository.save(application);

        // Notify seeker
        String seekerMsg = "You successfully applied for the position of " + job.getTitle() + " at " + job.getCompany().getName() + ".";
        notificationRepository.save(new Notification(user, seekerMsg));

        // Notify recruiter
        String recruiterMsg = user.getFullName() + " has applied for " + job.getTitle() + " (ATS Match: " + score + "%).";
        notificationRepository.save(new Notification(job.getRecruiter().getUser(), recruiterMsg));

        return savedApp;
    }

    @Override
    public List<Application> getApplicationsBySeeker(String seekerEmail) {
        return applicationRepository.findByUserEmail(seekerEmail);
    }

    @Override
    public List<Application> getApplicationsForRecruiter(String recruiterEmail) {
        return applicationRepository.findByJobRecruiterUserEmail(recruiterEmail);
    }

    @Override
    @Transactional
    public Application updateApplicationStatus(Long applicationId, String status, String recruiterEmail) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with ID: " + applicationId));

        // Security check
        if (!application.getJob().getRecruiter().getUser().getEmail().equals(recruiterEmail)) {
            throw new IllegalArgumentException("You are not authorized to update applicants for this job");
        }

        application.setStatus(status.toUpperCase());
        Application updated = applicationRepository.save(application);

        // Notify seeker
        String msg = "Your application for " + application.getJob().getTitle() + " at " + 
                application.getJob().getCompany().getName() + " has been updated to: " + status + ".";
        notificationRepository.save(new Notification(application.getUser(), msg));

        return updated;
    }

    @Override
    public Application getApplicationById(Long applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with ID: " + applicationId));
    }

    private int calculateAtsScore(Job job, Resume resume) {
        if (resume == null || resume.getParsedText() == null || resume.getParsedText().trim().isEmpty()) {
            return 50; // Default base score without parsed resume
        }

        String requirements = job.getRequirements();
        if (requirements == null || requirements.trim().isEmpty()) {
            return 75; // If no requirements specified, base match is 75%
        }

        String[] skills = requirements.split(",");
        String resumeText = resume.getParsedText().toLowerCase();
        int matched = 0;
        int total = skills.length;

        for (String skill : skills) {
            String cleanSkill = skill.trim().toLowerCase();
            if (resumeText.contains(cleanSkill)) {
                matched++;
            }
        }

        // Return a percentage matching score (at least 35% base, max 100%)
        int pct = (matched * 100) / total;
        return Math.max(35, Math.min(100, pct));
    }
}
