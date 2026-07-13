package com.hirehub.controller;

import com.hirehub.entity.Notification;
import com.hirehub.entity.Resume;
import com.hirehub.entity.Skill;
import com.hirehub.entity.User;
import com.hirehub.entity.UserExperience;
import com.hirehub.entity.UserEducation;
import com.hirehub.repository.ResumeRepository;
import com.hirehub.service.NotificationService;
import com.hirehub.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private NotificationService notificationService;

    // Get all skills in system
    @GetMapping("/skills")
    public ResponseEntity<List<Skill>> getAllSkills() {
        return ResponseEntity.ok(userService.getAllSkills());
    }

    // Get current user skills
    @GetMapping("/profile/skills")
    public ResponseEntity<Set<Skill>> getMySkills(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(userService.getUserSkills(principal.getName()));
    }

    // Add a skill
    @PostMapping("/profile/skills")
    public ResponseEntity<Set<Skill>> addSkill(@RequestParam String skillName, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(userService.addUserSkill(principal.getName(), skillName));
    }

    // Delete a skill
    @DeleteMapping("/profile/skills/{id}")
    public ResponseEntity<Set<Skill>> removeSkill(@PathVariable Integer id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(userService.removeUserSkill(principal.getName(), id));
    }

    // Upload Resume (Simulated parse)
    @PostMapping("/profile/resume/upload")
    public ResponseEntity<?> uploadResume(@RequestParam("file") MultipartFile file, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            User user = userService.findByEmail(principal.getName());
            
            // Build a simulated parsed text representation incorporating common keywords for testing
            String origName = file.getOriginalFilename();
            String parsedText = "Name: " + user.getFullName() + "\n" +
                    "Email: " + user.getEmail() + "\n" +
                    "Filename: " + origName + "\n" +
                    "Skills: Java, Spring Boot, React, MySQL, Javascript, CSS, HTML, Microservices, Docker, REST APIs, Git\n" +
                    "Experience: 2 Years as a Full Stack Developer. Built RESTful microservices and optimized UI components.";

            Resume resume = new Resume();
            resume.setUser(user);
            resume.setFileName(origName != null ? origName : "resume.pdf");
            resume.setFileType(file.getContentType());
            resume.setParsedText(parsedText);
            
            // Simulate AI Assessment
            int randomScore = 70 + new Random().nextInt(21); // Generate random score between 70 and 90
            resume.setAiScore(randomScore);
            
            String analysisJson = "{" +
                    "\"overall_rating\": \"Strong Match\"," +
                    "\"ATS_match_percentage\": " + randomScore + "," +
                    "\"strengths\": [\"Java development foundation\", \"React.js UI implementation\", \"Spring Boot REST APIs\"]," +
                    "\"gaps\": [\"Cloud deployment (AWS/Azure)\", \"Unit testing with JUnit/Mockito\"]," +
                    "\"career_recommendations\": [\"Practice system design patterns\", \"Learn Docker container configurations\"]" +
                    "}";
            resume.setAiAnalysis(analysisJson);

            Resume saved = resumeRepository.save(resume);

            // Add notification
            notificationService.createNotification(user.getId(), "Resume '" + saved.getFileName() + "' uploaded and parsed successfully. AI Score: " + randomScore + "/100.");

            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body("Failed to upload resume: " + ex.getMessage());
        }
    }

    // List user resumes
    @GetMapping("/profile/resumes")
    public ResponseEntity<List<Resume>> getMyResumes(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(resumeRepository.findByUserEmail(principal.getName()));
    }

    // Get notifications
    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getNotifications(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(notificationService.getNotificationsForUser(principal.getName()));
    }

    // Read all notifications
    @PostMapping("/notifications/read-all")
    public ResponseEntity<?> readAllNotifications(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        notificationService.markAllAsRead(principal.getName());
        return ResponseEntity.ok().body("All notifications marked as read");
    }

    // Read single notification
    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<?> readNotification(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    // Update Profile Metadata
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> profileData, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            User updated = userService.updateProfile(principal.getName(), profileData);
            return ResponseEntity.ok(updated);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // Get Profile Details
    @GetMapping("/profile/details")
    public ResponseEntity<?> getProfileDetails(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            User user = userService.findByEmail(principal.getName());
            List<UserExperience> experiences = userService.getExperiences(principal.getName());
            List<UserEducation> educations = userService.getEducations(principal.getName());
            
            Map<String, Object> details = new HashMap<>();
            details.put("user", user);
            details.put("experiences", experiences);
            details.put("educations", educations);
            return ResponseEntity.ok(details);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // Get Public Profile View
    @GetMapping("/profile/public/{email}")
    public ResponseEntity<?> getPublicProfile(@PathVariable String email) {
        try {
            User user = userService.findByEmail(email);
            if ("PRIVATE".equals(user.getProfileVisibility())) {
                return ResponseEntity.status(403).body("This profile is private.");
            }
            List<UserExperience> experiences = userService.getExperiences(email);
            List<UserEducation> educations = userService.getEducations(email);
            
            Map<String, Object> details = new HashMap<>();
            details.put("user", user);
            details.put("experiences", experiences);
            details.put("educations", educations);
            return ResponseEntity.ok(details);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // Add Work Experience
    @PostMapping("/profile/experience")
    public ResponseEntity<?> addExperience(@RequestBody UserExperience exp, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            UserExperience saved = userService.addExperience(principal.getName(), exp);
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // Update Work Experience
    @PutMapping("/profile/experience/{id}")
    public ResponseEntity<?> updateExperience(@PathVariable Long id, @RequestBody UserExperience exp, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            UserExperience updated = userService.updateExperience(id, exp);
            return ResponseEntity.ok(updated);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // Delete Work Experience
    @DeleteMapping("/profile/experience/{id}")
    public ResponseEntity<?> deleteExperience(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            userService.deleteExperience(id);
            return ResponseEntity.ok().body("Experience record deleted successfully");
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // Add Education
    @PostMapping("/profile/education")
    public ResponseEntity<?> addEducation(@RequestBody UserEducation edu, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            UserEducation saved = userService.addEducation(principal.getName(), edu);
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // Update Education
    @PutMapping("/profile/education/{id}")
    public ResponseEntity<?> updateEducation(@PathVariable Long id, @RequestBody UserEducation edu, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            UserEducation updated = userService.updateEducation(id, edu);
            return ResponseEntity.ok(updated);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // Delete Education
    @DeleteMapping("/profile/education/{id}")
    public ResponseEntity<?> deleteEducation(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            userService.deleteEducation(id);
            return ResponseEntity.ok().body("Education record deleted successfully");
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
