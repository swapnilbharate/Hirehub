package com.hirehub.controller;

import com.hirehub.entity.Job;
import com.hirehub.entity.User;
import com.hirehub.entity.SavedJob;
import com.hirehub.service.JobService;
import com.hirehub.repository.SavedJobRepository;
import com.hirehub.repository.UserRepository;
import com.hirehub.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    @Autowired
    private SavedJobRepository savedJobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    // Public: Browse all jobs
    @GetMapping
    public ResponseEntity<List<Job>> getAllOpenJobs() {
        return ResponseEntity.ok(jobService.getOpenJobs());
    }

    // Public: View specific job
    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    // Public: Search and filter jobs
    @GetMapping("/search")
    public ResponseEntity<List<Job>> searchJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String jobType) {
        return ResponseEntity.ok(jobService.searchJobs(title, location, jobType));
    }

    // Secured: Recruiter's own posted jobs
    @GetMapping("/my-postings")
    public ResponseEntity<List<Job>> getMyJobPostings(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(jobService.getJobsByRecruiter(principal.getName()));
    }

    // Secured: Create Job Post
    @PostMapping
    public ResponseEntity<Job> createJobPost(@RequestBody Job job, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(jobService.createJob(job, principal.getName()));
    }

    // Secured: Update Job Post
    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJobPost(
            @PathVariable Long id, 
            @RequestBody Job jobDetails, 
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(jobService.updateJob(id, jobDetails, principal.getName()));
    }

    // Secured: Delete Job Post
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJobPost(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            jobService.deleteJob(id, principal.getName());
            return ResponseEntity.ok().body("Job posting deleted successfully");
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // Save/Bookmark Job
    @PostMapping("/{id}/save")
    public ResponseEntity<?> saveJob(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Job job = jobRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Job not found"));

            if (savedJobRepository.existsByUserIdAndJobId(user.getId(), job.getId())) {
                return ResponseEntity.badRequest().body("Job is already saved");
            }

            SavedJob savedJob = new SavedJob(user, job);
            savedJobRepository.save(savedJob);
            return ResponseEntity.ok().body("Job bookmarked successfully");
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // Remove Bookmark
    @DeleteMapping("/{id}/save")
    @Transactional
    public ResponseEntity<?> unsaveJob(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            savedJobRepository.deleteByUserIdAndJobId(user.getId(), id);
            return ResponseEntity.ok().body("Job bookmark removed successfully");
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // List Bookmarked Jobs
    @GetMapping("/saved")
    public ResponseEntity<?> getSavedJobs(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            List<SavedJob> saved = savedJobRepository.findByUserEmail(principal.getName());
            List<Job> jobs = saved.stream().map(SavedJob::getJob).toList();
            return ResponseEntity.ok(jobs);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // AI Job Recommendations based on Skills
    @GetMapping("/recommended")
    public ResponseEntity<?> getRecommendedJobs(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            java.util.Set<com.hirehub.entity.Skill> skills = user.getSkills();
            List<Job> allOpenJobs = jobService.getOpenJobs();

            List<Job> recommended = allOpenJobs.stream()
                    .filter(job -> {
                        if (job.getRequirements() == null || job.getRequirements().trim().isEmpty()) {
                            return false;
                        }
                        String requirements = job.getRequirements().toLowerCase();
                        return skills.stream().anyMatch(skill -> requirements.contains(skill.getName().toLowerCase()));
                    })
                    .toList();

            return ResponseEntity.ok(recommended);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
