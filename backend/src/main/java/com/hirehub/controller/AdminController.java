package com.hirehub.controller;

import com.hirehub.entity.User;
import com.hirehub.repository.ApplicationRepository;
import com.hirehub.repository.JobRepository;
import com.hirehub.repository.RecruiterRepository;
import com.hirehub.repository.UserRepository;
import com.hirehub.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RecruiterRepository recruiterRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    // Get all users
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Block / Unblock user
    @PutMapping("/users/{userId}/toggle-block")
    public ResponseEntity<?> toggleUserBlock(@PathVariable Long userId) {
        try {
            User user = userService.toggleUserBlock(userId);
            return ResponseEntity.ok(user);
        } catch (Exception ex) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    // Delete a job posting (Admin moderation)
    @DeleteMapping("/jobs/{jobId}")
    public ResponseEntity<?> moderateDeleteJob(@PathVariable Long jobId) {
        try {
            jobRepository.deleteById(jobId);
            return ResponseEntity.ok().body("Job posting deleted by administrator.");
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // Portal Global Analytics
    @GetMapping("/analytics")
    public ResponseEntity<?> getGlobalStats() {
        long totalUsers = userRepository.count();
        long totalRecruiters = recruiterRepository.count();
        long totalJobs = jobRepository.count();
        long totalApplications = applicationRepository.count();

        // Count seekers specifically
        long totalSeekers = totalUsers - totalRecruiters - 1; // subtract recruiters and 1 admin
        totalSeekers = Math.max(0, totalSeekers);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalRecruiters", totalRecruiters);
        stats.put("totalSeekers", totalSeekers);
        stats.put("totalJobs", totalJobs);
        stats.put("totalApplications", totalApplications);

        // Mock chart statistics data
        Map<String, Object> chartData = new HashMap<>();
        chartData.put("labels", List.of("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"));
        chartData.put("applications", List.of(12, 19, 32, 5, 22, 10, 45));
        chartData.put("jobs", List.of(3, 8, 12, 14, 9, 21, 30));
        stats.put("chartData", chartData);

        // List recent actions
        stats.put("recentActivities", List.of(
                "New job seeker signed up: Emma Watson",
                "New job posting created: Senior Software Engineer (Backend)",
                "Interview scheduled by Sarah Connor",
                "Alex Mercer applied for Full Stack Engineer"
        ));

        return ResponseEntity.ok(stats);
    }
}
