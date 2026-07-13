package com.hirehub.service;

import java.util.List;
import java.util.Map;

public interface AiService {
    Map<String, Object> analyzeResume(Long resumeId);
    Map<String, Object> checkAtsCompatibility(String jobDesc, String resumeText);
    Map<String, Object> analyzeSkillGap(String targetRole, List<String> userSkills);
    Map<String, Object> generateInterviewQuestions(String jobTitle, String jobDesc, String candidateExp);
    Map<String, Object> getChatbotResponse(String userMessage, String userRole);
}
