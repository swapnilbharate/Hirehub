package com.hirehub.controller;

import com.hirehub.entity.Interview;
import com.hirehub.repository.ApplicationRepository;
import com.hirehub.repository.JobRepository;
import com.hirehub.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recruiter")
public class RecruiterController {

    @Autowired
    private InterviewService interviewService;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    // Schedule interview
    @PostMapping("/interviews/schedule")
    public ResponseEntity<?> schedule(
            @RequestParam Long applicationId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date,
            @RequestParam String locationOrLink,
            @RequestParam(required = false) String notes,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            Interview interview = interviewService.scheduleInterview(applicationId, date, locationOrLink, notes, principal.getName());
            return ResponseEntity.ok(interview);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // List scheduled interviews
    @GetMapping("/interviews")
    public ResponseEntity<List<Interview>> getMyInterviews(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(interviewService.getInterviewsForRecruiter(principal.getName()));
    }

    // Recruiter Dashboard Statistics
    @GetMapping("/stats")
    public ResponseEntity<?> getRecruiterStats(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        String email = principal.getName();
        
        long totalJobs = jobRepository.findByRecruiterUserEmail(email).size();
        List<com.hirehub.entity.Application> apps = applicationRepository.findByJobRecruiterUserEmail(email);
        long totalApps = apps.size();
        
        long shortlisted = apps.stream().filter(a -> "SHORTLISTED".equals(a.getStatus()) || "INTERVIEW_SCHEDULED".equals(a.getStatus())).count();
        long rejected = apps.stream().filter(a -> "REJECTED".equals(a.getStatus())).count();
        long pending = totalApps - shortlisted - rejected;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalJobs", totalJobs);
        stats.put("totalApplications", totalApps);
        stats.put("shortlisted", shortlisted);
        stats.put("rejected", rejected);
        stats.put("pending", pending);

        // List interview reminders
        List<Interview> upcomingInterviews = interviewService.getInterviewsForRecruiter(email);
        stats.put("upcomingInterviews", upcomingInterviews);

        return ResponseEntity.ok(stats);
    }
}
