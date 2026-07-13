package com.hirehub.service;

import com.hirehub.dto.RegisterRequest;
import com.hirehub.entity.User;
import com.hirehub.entity.Skill;
import com.hirehub.entity.UserExperience;
import com.hirehub.entity.UserEducation;
import org.springframework.security.core.userdetails.UserDetailsService;
import java.util.List;
import java.util.Set;
import java.util.Map;

public interface UserService extends UserDetailsService {
    User registerUser(RegisterRequest request);
    User findByEmail(String email);
    List<User> getAllUsers();
    User toggleUserBlock(Long userId);
    Set<Skill> getUserSkills(String email);
    Set<Skill> addUserSkill(String email, String skillName);
    Set<Skill> removeUserSkill(String email, Integer skillId);
    List<Skill> getAllSkills();

    // Profile Enhancement Methods
    User updateProfile(String email, Map<String, String> profileData);
    UserExperience addExperience(String email, UserExperience exp);
    UserExperience updateExperience(Long id, UserExperience exp);
    void deleteExperience(Long id);
    UserEducation addEducation(String email, UserEducation edu);
    UserEducation updateEducation(Long id, UserEducation edu);
    void deleteEducation(Long id);
    List<UserExperience> getExperiences(String email);
    List<UserEducation> getEducations(String email);
}
