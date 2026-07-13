package com.hirehub.controller;

import com.hirehub.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    // 1. Resume Analyzer Report
    @GetMapping("/resume/{resumeId}")
    public ResponseEntity<Map<String, Object>> analyzeResume(@PathVariable Long resumeId) {
        return ResponseEntity.ok(aiService.analyzeResume(resumeId));
    }

    // 2. ATS Compatibility Checker
    @PostMapping("/ats-check")
    public ResponseEntity<Map<String, Object>> checkAts(
            @RequestBody Map<String, String> request) {
        String jobDesc = request.get("jobDescription");
        String resumeText = request.get("resumeText");
        return ResponseEntity.ok(aiService.checkAtsCompatibility(jobDesc, resumeText));
    }

    // 3. Skill Gap Analysis
    @PostMapping("/skill-gap")
    public ResponseEntity<Map<String, Object>> checkSkillGap(
            @RequestBody Map<String, Object> request) {
        String targetRole = (String) request.get("targetRole");
        
        Object skillsObj = request.get("userSkills");
        List<String> userSkillsList = new java.util.ArrayList<>();
        if (skillsObj instanceof List) {
            for (Object obj : (List<?>) skillsObj) {
                userSkillsList.add(String.valueOf(obj));
            }
        } else if (skillsObj instanceof String) {
            String[] split = ((String) skillsObj).split(",");
            for (String s : split) {
                userSkillsList.add(s.trim());
            }
        }
        
        return ResponseEntity.ok(aiService.analyzeSkillGap(targetRole, userSkillsList));
    }

    // 4. Interview Prep / Question Generator
    @PostMapping("/interview-prep")
    public ResponseEntity<Map<String, Object>> getPrepQuestions(
            @RequestBody Map<String, String> request) {
        String jobTitle = request.get("jobTitle");
        String jobDesc = request.get("jobDescription");
        String candidateExp = request.get("experienceLevel");
        return ResponseEntity.ok(aiService.generateInterviewQuestions(jobTitle, jobDesc, candidateExp));
    }

    // 5. Career Advisor Chatbot
    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chatbotChat(
            @RequestBody Map<String, String> request,
            Principal principal) {
        String message = request.get("message");
        String userRole = "ROLE_JOBSEEKER"; // Default
        return ResponseEntity.ok(aiService.getChatbotResponse(message, userRole));
    }
}
