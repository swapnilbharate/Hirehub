package com.hirehub.controller;

import com.hirehub.entity.Application;
import com.hirehub.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    // Apply for a job
    @PostMapping("/apply/{jobId}")
    public ResponseEntity<?> applyForJob(
            @PathVariable Long jobId,
            @RequestParam(required = false) String coverLetter,
            @RequestParam(required = false) Long resumeId,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            Application app = applicationService.applyJob(jobId, principal.getName(), coverLetter, resumeId);
            return ResponseEntity.ok(app);
        } catch (Exception ex) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    // Seeker view their own applications
    @GetMapping("/my-applications")
    public ResponseEntity<List<Application>> getMyApplications(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(applicationService.getApplicationsBySeeker(principal.getName()));
    }

    // Recruiter view applicants for their jobs
    @GetMapping("/recruiter/list")
    public ResponseEntity<List<Application>> getRecruiterApplicants(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(applicationService.getApplicationsForRecruiter(principal.getName()));
    }

    // Recruiter change application status (SHORTLIST, REJECT, etc)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            Application app = applicationService.updateApplicationStatus(id, status, principal.getName());
            return ResponseEntity.ok(app);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // View specific application details
    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplicationDetails(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }
}
