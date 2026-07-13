package com.hirehub.service.impl;

import com.hirehub.entity.Resume;
import com.hirehub.exception.ResourceNotFoundException;
import com.hirehub.repository.ResumeRepository;
import com.hirehub.service.AiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AiServiceImpl implements AiService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final List<String> TECH_KEYWORDS = Arrays.asList(
            "Java", "Spring Boot", "Hibernate", "React", "Angular", "Vue", "Javascript", "TypeScript", 
            "HTML", "CSS", "Tailwind", "Bootstrap", "Python", "Django", "Flask", "SQL", "MySQL", "PostgreSQL", 
            "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Microservices", "Git", "REST APIs",
            "Figma", "Node.js", "Express", "Redux", "GraphQL", "TensorFlow", "PyTorch", "Machine Learning", "NLP"
    );

    private String getApiKey() {
        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            return geminiApiKey;
        }
        return System.getenv("GEMINI_API_KEY");
    }

    private String cleanJsonResponse(String content) {
        if (content == null) return null;
        content = content.trim();
        if (content.startsWith("```json")) {
            content = content.substring(7);
        } else if (content.startsWith("```")) {
            content = content.substring(3);
        }
        if (content.endsWith("```")) {
            content = content.substring(0, content.length() - 3);
        }
        return content.trim();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> callGemini(String prompt) {
        String key = getApiKey();
        if (key == null || key.trim().isEmpty()) {
            return null; // Fallback to local mode
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + key;

            // Build request payload
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> partsMap = new HashMap<>();
            partsMap.put("parts", Collections.singletonList(textPart));

            Map<String, Object> payload = new HashMap<>();
            payload.put("contents", Collections.singletonList(partsMap));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                List<?> candidates = (List<?>) body.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
                    Map<?, ?> content = (Map<?, ?>) candidate.get("content");
                    if (content != null) {
                        List<?> parts = (List<?>) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Map<?, ?> part = (Map<?, ?>) parts.get(0);
                            String rawText = (String) part.get("text");
                            String cleaned = cleanJsonResponse(rawText);
                            return objectMapper.readValue(cleaned, Map.class);
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Gemini API call failed, falling back to local analyzer. Error: " + e.getMessage());
        }
        return null;
    }

    @Override
    public Map<String, Object> analyzeResume(Long resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with ID: " + resumeId));

        String text = resume.getParsedText() != null ? resume.getParsedText() : "";
        
        // Try Gemini AI first
        String prompt = "Analyze the following resume text. Rate the profile, highlight strengths, identify gaps, and provide recommendations.\n\n" +
                "Return ONLY a JSON object in this format:\n" +
                "{\n" +
                "  \"score\": 85,\n" +
                "  \"rating\": \"Excellent Profile / Good Profile / Needs Improvement\",\n" +
                "  \"strengths\": [\"Strength 1\", \"Strength 2\"],\n" +
                "  \"gaps\": [\"Gap 1\", \"Gap 2\"],\n" +
                "  \"recommendations\": [\"Recommendation 1\", \"Recommendation 2\"]\n" +
                "}\n\n" +
                "Resume Text:\n" + text;

        Map<String, Object> geminiResult = callGemini(prompt);
        if (geminiResult != null) {
            geminiResult.put("fileName", resume.getFileName());
            return geminiResult;
        }

        // Fallback to Smart Local Mode
        String textLower = text.toLowerCase();
        List<String> foundSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String skill : TECH_KEYWORDS) {
            if (textLower.contains(skill.toLowerCase())) {
                foundSkills.add(skill);
            } else {
                if (missingSkills.size() < 5) {
                    missingSkills.add(skill);
                }
            }
        }

        int baseScore = 40 + (foundSkills.size() * 5);
        int finalScore = Math.min(95, baseScore);

        Map<String, Object> response = new HashMap<>();
        response.put("fileName", resume.getFileName());
        response.put("score", finalScore);
        response.put("rating", finalScore >= 80 ? "Excellent Profile" : (finalScore >= 60 ? "Good Profile" : "Needs Improvement"));
        response.put("strengths", foundSkills.isEmpty() ? Collections.singletonList("Basic text structure") : foundSkills);
        response.put("gaps", missingSkills);
        
        List<String> recommendations = new ArrayList<>();
        if (foundSkills.size() < 4) {
            recommendations.add("Add more technical keywords matching your field.");
        }
        recommendations.add("Incorporate quantifiable metrics into your work experience sections (e.g., 'Optimized query latency by 20%').");
        recommendations.add("Consider taking online certifications in: " + String.join(", ", missingSkills.subList(0, Math.min(2, missingSkills.size()))));
        response.put("recommendations", recommendations);

        return response;
    }

    @Override
    public Map<String, Object> checkAtsCompatibility(String jobDesc, String resumeText) {
        if (jobDesc == null || jobDesc.trim().isEmpty() || resumeText == null || resumeText.trim().isEmpty()) {
            Map<String, Object> err = new HashMap<>();
            err.put("score", 0);
            err.put("error", "Job description and resume text must not be empty.");
            return err;
        }

        // Try Gemini AI first
        String prompt = "Check the compatibility of the following resume text against the job description. Identify matched keywords, missing keywords, and suggest improvements.\n\n" +
                "Return ONLY a JSON object in this format:\n" +
                "{\n" +
                "  \"score\": 75,\n" +
                "  \"matchedKeywords\": [\"Skill A\", \"Skill B\"],\n" +
                "  \"missingKeywords\": [\"Skill C\", \"Skill D\"],\n" +
                "  \"suggestions\": [\"Improvement suggestion 1\", \"Improvement suggestion 2\"]\n" +
                "}\n\n" +
                "Job Description:\n" + jobDesc + "\n\nResume Text:\n" + resumeText;

        Map<String, Object> geminiResult = callGemini(prompt);
        if (geminiResult != null) {
            geminiResult.put("matchPercentage", geminiResult.get("score"));
            return geminiResult;
        }

        // Fallback to Smart Local Mode
        String descLower = jobDesc.toLowerCase();
        String resumeLower = resumeText.toLowerCase();

        List<String> requiredKeywords = new ArrayList<>();
        for (String kw : TECH_KEYWORDS) {
            if (descLower.contains(kw.toLowerCase())) {
                requiredKeywords.add(kw);
            }
        }

        if (requiredKeywords.isEmpty()) {
            requiredKeywords = Arrays.asList("Java", "SQL", "Git", "REST APIs");
        }

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String kw : requiredKeywords) {
            if (resumeLower.contains(kw.toLowerCase())) {
                matched.add(kw);
            } else {
                missing.add(kw);
            }
        }

        int pct = 100;
        if (!requiredKeywords.isEmpty()) {
            pct = (matched.size() * 100) / requiredKeywords.size();
        }
        int finalScore = Math.max(30, Math.min(100, pct));

        Map<String, Object> result = new HashMap<>();
        result.put("score", finalScore);
        result.put("matchPercentage", finalScore);
        result.put("matchedKeywords", matched);
        result.put("missingKeywords", missing);
        
        List<String> suggestions = new ArrayList<>();
        if (finalScore >= 80) {
            suggestions.add("Your resume is highly compatible with this job description!");
            suggestions.add("Keep your formatting clean and submit your application.");
        } else if (finalScore >= 50) {
            suggestions.add("Good match, but you should explicitly mention: " + String.join(", ", missing));
            suggestions.add("Ensure these skills are reflected in your project descriptions.");
        } else {
            suggestions.add("Low compatibility. We recommend tailoring your resume to address missing requirements: " + String.join(", ", missing));
        }
        result.put("suggestions", suggestions);

        return result;
    }

    @Override
    public Map<String, Object> analyzeSkillGap(String targetRole, List<String> userSkills) {
        // Try Gemini AI first
        String prompt = "Perform a skill gap audit for a person with the following current skills who wants to become a: " + targetRole + ".\n\n" +
                "Return ONLY a JSON object in this format:\n" +
                "{\n" +
                "  \"role\": \"" + targetRole + "\",\n" +
                "  \"currentSkills\": [\"Skill A\", \"Skill B\"],\n" +
                "  \"missingSkills\": [\"Skill C\", \"Skill D\"],\n" +
                "  \"learningResources\": {\n" +
                "    \"Skill C\": \"Course/Tutorial name and platform\",\n" +
                "    \"Skill D\": \"Course/Tutorial name and platform\"\n" +
                "  }\n" +
                "}\n\n" +
                "User Current Skills:\n" + String.join(", ", userSkills);

        Map<String, Object> geminiResult = callGemini(prompt);
        if (geminiResult != null) {
            return geminiResult;
        }

        // Fallback to Smart Local Mode
        Map<String, List<String>> roleSkills = new HashMap<>();
        roleSkills.put("Backend Developer", Arrays.asList("Java", "Spring Boot", "Hibernate", "SQL", "MySQL", "REST APIs", "Docker", "Microservices"));
        roleSkills.put("Frontend Developer", Arrays.asList("HTML", "CSS", "Javascript", "TypeScript", "React", "Tailwind", "Bootstrap", "Git"));
        roleSkills.put("Full Stack Developer", Arrays.asList("Java", "Spring Boot", "React", "MySQL", "Javascript", "REST APIs", "Docker", "Git"));
        roleSkills.put("Data Scientist", Arrays.asList("Python", "SQL", "Docker", "AWS", "Git"));

        String matchedRole = "Backend Developer";
        for (String role : roleSkills.keySet()) {
            if (targetRole.toLowerCase().contains(role.toLowerCase()) || role.toLowerCase().contains(targetRole.toLowerCase())) {
                matchedRole = role;
                break;
            }
        }

        List<String> targetList = roleSkills.get(matchedRole);
        List<String> missing = new ArrayList<>();
        List<String> current = new ArrayList<>();

        for (String skill : targetList) {
            boolean found = false;
            for (String us : userSkills) {
                if (us.equalsIgnoreCase(skill)) {
                    found = true;
                    break;
                }
            }
            if (found) {
                current.add(skill);
            } else {
                missing.add(skill);
            }
        }

        Map<String, String> recommendations = new HashMap<>();
        for (String m : missing) {
            if (m.equals("Java") || m.equals("Spring Boot")) {
                recommendations.put(m, "Course: 'Spring Framework Masterclass' on Udemy / Official Spring documentation.");
            } else if (m.equals("React")) {
                recommendations.put(m, "Course: 'React - The Complete Guide' by Academind / react.dev interactive tutorials.");
            } else if (m.equals("MySQL") || m.equals("SQL")) {
                recommendations.put(m, "Course: 'Complete SQL Bootcamp' on Coursera / W3Schools tutorials.");
            } else if (m.equals("Docker") || m.equals("Microservices")) {
                recommendations.put(m, "Tutorial: 'Docker for Beginners' / 'Spring Cloud Microservices' reference docs.");
            } else {
                recommendations.put(m, "Search for introductory courses and build a small side project using " + m + ".");
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("role", matchedRole);
        result.put("currentSkills", current);
        result.put("missingSkills", missing);
        result.put("learningResources", recommendations);

        return result;
    }

    @Override
    public Map<String, Object> generateInterviewQuestions(String jobTitle, String jobDesc, String candidateExp) {
        // Try Gemini AI first
        String prompt = "Generate standard technical and behavioral interview questions for the job title: " + jobTitle + 
                " with experience level: " + candidateExp + ". Use the job description for context: " + jobDesc + ".\n\n" +
                "Return ONLY a JSON object in this format:\n" +
                "{\n" +
                "  \"jobTitle\": \"" + jobTitle + "\",\n" +
                "  \"technical\": [\"Question 1\", \"Question 2\", \"Question 3\", \"Question 4\"],\n" +
                "  \"behavioral\": [\"Question A\", \"Question B\", \"Question C\"]\n" +
                "}\n";

        Map<String, Object> geminiResult = callGemini(prompt);
        if (geminiResult != null) {
            return geminiResult;
        }

        // Fallback to Smart Local Mode
        List<String> technicalQuestions = new ArrayList<>();
        List<String> behavioralQuestions = new ArrayList<>();

        String title = jobTitle.toLowerCase();
        if (title.contains("java") || title.contains("backend") || title.contains("spring")) {
            technicalQuestions.add("Explain Dependency Injection (DI) and Inversion of Control (IoC) in Spring Boot.");
            technicalQuestions.add("How does Hibernate manage entity states (Transient, Persistent, Detached)?");
            technicalQuestions.add("What is the difference between Optimistic and Pessimistic locking in MySQL database operations?");
            technicalQuestions.add("Explain how you would design a REST API to support high-throughput resume uploads.");
        } else if (title.contains("react") || title.contains("frontend") || title.contains("ui")) {
            technicalQuestions.add("What is the Virtual DOM and how does React perform reconciliation?");
            technicalQuestions.add("Compare useEffect cleanup functions vs component lifecycle methods.");
            technicalQuestions.add("How do you manage global state in React? Explain your experience with Redux Toolkit or Context API.");
            technicalQuestions.add("How do you optimize React application performance (useMemo, useCallback, Code Splitting)?");
        } else {
            technicalQuestions.add("What are microservices, and how do they communicate with each other?");
            technicalQuestions.add("How do you handle schema changes and indexing in a relational database like MySQL?");
            technicalQuestions.add("Explain your preferred git branching strategy for collaborating in a development team.");
        }

        behavioralQuestions.add("Tell me about a time you had to learn a new programming language or tool in a short timeframe. How did you approach it?");
        behavioralQuestions.add("Describe a situation where you had a disagreement with a team member about a technical approach. How did you resolve it?");
        behavioralQuestions.add("Tell me about a challenging bug you faced in a previous project. What was your debugging methodology?");
        
        Map<String, Object> result = new HashMap<>();
        result.put("jobTitle", jobTitle);
        result.put("technical", technicalQuestions);
        result.put("behavioral", behavioralQuestions);
        return result;
    }

    @Override
    public Map<String, Object> getChatbotResponse(String userMessage, String userRole) {
        // Try Gemini AI first
        String prompt = "You are a professional AI Career Coach on the HireHub portal. Help the user with their career advice. Keep your response concise (under 200 words).\n\n" +
                "Return ONLY a JSON object in this format:\n" +
                "{\n" +
                "  \"reply\": \"Your chatbot advice text here...\",\n" +
                "  \"actionItems\": [\"Action item 1\", \"Action item 2\", \"Action item 3\"]\n" +
                "}\n\n" +
                "User Message: " + userMessage;

        Map<String, Object> geminiResult = callGemini(prompt);
        if (geminiResult != null) {
            geminiResult.put("timestamp", new Date());
            return geminiResult;
        }

        // Fallback to Smart Local Mode
        String msg = userMessage.toLowerCase();
        String reply;
        List<String> actionItems = new ArrayList<>();

        if (msg.contains("interview")) {
            reply = "Preparing for an interview can be stressful! For technical roles, ensure you review Core Concepts (e.g. Spring Boot, React state), Data Structures (Lists, Maps), and SQL query optimization. Here is your roadmap:";
            actionItems.add("Practice coding on LeetCode/HackerRank.");
            actionItems.add("Prepare 3 projects to explain in detail (architecture, challenges faced, results).");
            actionItems.add("Conduct mock interviews with a friend or record your answers.");
        } else if (msg.contains("resume") || msg.contains("cv") || msg.contains("ats")) {
            reply = "To pass Applicant Tracking Systems (ATS), ensure your resume is formatted in a clean single-column layout without complex graphs. Match your terms with the job posting description:";
            actionItems.add("Scan job ads for core skills and insert them exactly as written.");
            actionItems.add("Save your resume as a clean PDF.");
            actionItems.add("Use action verbs (e.g., 'Implemented', 'Developed', 'Spearheaded') and specify metrics.");
        } else if (msg.contains("career") || msg.contains("job") || msg.contains("seeker")) {
            reply = "Finding the right job involves building a professional online profile and networking. On HireHub, search by location and skills:";
            actionItems.add("Complete your profile skills list.");
            actionItems.add("Upload your latest PDF resume in the dashboard.");
            actionItems.add("Apply to 3 relevant postings daily and follow up on status changes.");
        } else if (msg.contains("hello") || msg.contains("hi") || msg.contains("hey")) {
            reply = "Hello! I am your HireHub AI Career Coach. I can help you with resume writing, interview preparation, upskilling advice, or job search strategies. What's on your mind today?";
            actionItems.add("Ask: 'How do I optimize my resume?'");
            actionItems.add("Ask: 'Give me tips for a coding interview'");
            actionItems.add("Ask: 'What is a skill gap analysis?'");
        } else {
            reply = "That's a great question! Tailoring your profile, learning in-demand skills (like Java Spring or React), and practicing your communication are the keys to landing top recruitment offers. Here are immediate steps you can take:";
            actionItems.add("Upload a resume to run the Resume Analyzer.");
            actionItems.add("Use our Interview Prep tool to get custom questions.");
            actionItems.add("Review the jobs section to see active recruiter postings.");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("reply", reply);
        result.put("actionItems", actionItems);
        result.put("timestamp", new Date());
        return result;
    }
}
