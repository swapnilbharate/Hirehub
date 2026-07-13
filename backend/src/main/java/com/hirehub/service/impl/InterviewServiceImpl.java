package com.hirehub.service.impl;

import com.hirehub.entity.*;
import com.hirehub.exception.ResourceNotFoundException;
import com.hirehub.repository.*;
import com.hirehub.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InterviewServiceImpl implements InterviewService {

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    @Transactional
    public Interview scheduleInterview(Long applicationId, LocalDateTime date, String locationOrLink, String notes, String recruiterEmail) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with ID: " + applicationId));

        // Security check
        if (!application.getJob().getRecruiter().getUser().getEmail().equals(recruiterEmail)) {
            throw new IllegalArgumentException("You are not authorized to schedule interviews for this posting");
        }

        Interview interview = new Interview();
        interview.setApplication(application);
        interview.setInterviewDate(date);
        interview.setLocationOrLink(locationOrLink);
        interview.setNotes(notes);
        interview.setStatus("SCHEDULED");

        Interview saved = interviewRepository.save(interview);

        // Update application status
        application.setStatus("INTERVIEW_SCHEDULED");
        applicationRepository.save(application);

        // Notify Job Seeker
        String seekerMsg = "An interview has been scheduled for " + application.getJob().getTitle() + 
                " at " + application.getJob().getCompany().getName() + " on " + date.toString().replace("T", " ") + ". Link: " + locationOrLink;
        notificationRepository.save(new Notification(application.getUser(), seekerMsg));

        return saved;
    }

    @Override
    public List<Interview> getInterviewsForRecruiter(String recruiterEmail) {
        return interviewRepository.findByApplicationJobRecruiterUserEmail(recruiterEmail);
    }

    @Override
    public List<Interview> getInterviewsForSeeker(String seekerEmail) {
        return interviewRepository.findByApplicationUserEmail(seekerEmail);
    }

    @Override
    @Transactional
    public Interview updateInterviewStatus(Long interviewId, String status, String userEmail) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with ID: " + interviewId));

        // Verify user is part of interview (either the recruiter or the seeker)
        String recruiterEmail = interview.getApplication().getJob().getRecruiter().getUser().getEmail();
        String seekerEmail = interview.getApplication().getUser().getEmail();

        if (!userEmail.equals(recruiterEmail) && !userEmail.equals(seekerEmail)) {
            throw new IllegalArgumentException("You are not authorized to modify this interview");
        }

        interview.setStatus(status.toUpperCase());
        Interview updated = interviewRepository.save(interview);

        // Notify the other party
        String recipientEmail = userEmail.equals(recruiterEmail) ? seekerEmail : recruiterEmail;
        User recipient = interview.getApplication().getUser().getEmail().equals(recipientEmail) 
                ? interview.getApplication().getUser() 
                : interview.getApplication().getJob().getRecruiter().getUser();

        String msg = "The interview scheduled for " + interview.getApplication().getJob().getTitle() + 
                " on " + interview.getInterviewDate() + " has been updated to: " + status + ".";
        notificationRepository.save(new Notification(recipient, msg));

        return updated;
    }
}
