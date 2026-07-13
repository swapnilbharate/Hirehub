package com.hirehub.service;

import com.hirehub.entity.Interview;
import java.time.LocalDateTime;
import java.util.List;

public interface InterviewService {
    Interview scheduleInterview(Long applicationId, LocalDateTime date, String locationOrLink, String notes, String recruiterEmail);
    List<Interview> getInterviewsForRecruiter(String recruiterEmail);
    List<Interview> getInterviewsForSeeker(String seekerEmail);
    Interview updateInterviewStatus(Long interviewId, String status, String userEmail);
}
