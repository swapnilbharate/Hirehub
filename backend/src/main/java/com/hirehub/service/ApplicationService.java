package com.hirehub.service;

import com.hirehub.entity.Application;
import java.util.List;

public interface ApplicationService {
    Application applyJob(Long jobId, String seekerEmail, String coverLetter, Long resumeId);
    List<Application> getApplicationsBySeeker(String seekerEmail);
    List<Application> getApplicationsForRecruiter(String recruiterEmail);
    Application updateApplicationStatus(Long applicationId, String status, String recruiterEmail);
    Application getApplicationById(Long applicationId);
}
