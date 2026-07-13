package com.hirehub.service.impl;

import com.hirehub.dto.RegisterRequest;
import com.hirehub.entity.*;
import com.hirehub.exception.ResourceNotFoundException;
import com.hirehub.repository.*;
import com.hirehub.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private RecruiterRepository recruiterRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserExperienceRepository userExperienceRepository;

    @Autowired
    private UserEducationRepository userEducationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public User registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.getRole()));

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(role);
        user.setStatus("ACTIVE");
        user.setProfilePhotoUrl("/images/avatars/default-avatar.png");
        user.setHeadline("Job Seeker on HireHub");

        User savedUser = userRepository.save(user);

        if ("ROLE_RECRUITER".equals(role.getName())) {
            Company company = new Company();
            company.setName(request.getCompanyName() != null ? request.getCompanyName() : "Independent Recruiter");
            company.setLocation(request.getCompanyLocation() != null ? request.getCompanyLocation() : "Remote");
            company.setCoverPhotoUrl("/images/companies/google-office.png");
            company = companyRepository.save(company);

            Recruiter recruiter = new Recruiter();
            recruiter.setUser(savedUser);
            recruiter.setCompany(company);
            recruiter.setPosition(request.getPosition() != null ? request.getPosition() : "Hiring Manager");
            recruiterRepository.save(recruiter);
        }

        return savedUser;
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public User toggleUserBlock(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        
        // Prevent blocking platform admin
        if ("ROLE_ADMIN".equals(user.getRole().getName())) {
            throw new IllegalArgumentException("Cannot block Admin account");
        }

        if ("ACTIVE".equals(user.getStatus())) {
            user.setStatus("BLOCKED");
        } else {
            user.setStatus("ACTIVE");
        }
        return userRepository.save(user);
    }

    @Override
    public Set<Skill> getUserSkills(String email) {
        User user = findByEmail(email);
        return user.getSkills();
    }

    @Override
    @Transactional
    public Set<Skill> addUserSkill(String email, String skillName) {
        User user = findByEmail(email);
        
        String cleanSkillName = skillName.trim();
        Skill skill = skillRepository.findByName(cleanSkillName)
                .orElseGet(() -> skillRepository.save(new Skill(cleanSkillName)));

        user.getSkills().add(skill);
        userRepository.save(user);
        return user.getSkills();
    }

    @Override
    @Transactional
    public Set<Skill> removeUserSkill(String email, Integer skillId) {
        User user = findByEmail(email);
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with ID: " + skillId));

        user.getSkills().remove(skill);
        userRepository.save(user);
        return user.getSkills();
    }

    @Override
    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    @Override
    @Transactional
    public User updateProfile(String email, Map<String, String> profileData) {
        User user = findByEmail(email);
        
        if (profileData.containsKey("fullName")) user.setFullName(profileData.get("fullName"));
        if (profileData.containsKey("phone")) user.setPhone(profileData.get("phone"));
        if (profileData.containsKey("headline")) user.setHeadline(profileData.get("headline"));
        if (profileData.containsKey("bio")) user.setBio(profileData.get("bio"));
        if (profileData.containsKey("profilePhotoUrl")) user.setProfilePhotoUrl(profileData.get("profilePhotoUrl"));
        if (profileData.containsKey("location")) user.setLocation(profileData.get("location"));
        
        if (profileData.containsKey("experienceYears")) {
            try {
                user.setExperienceYears(Integer.parseInt(profileData.get("experienceYears")));
            } catch (NumberFormatException e) {
                // Ignore invalid numbers
            }
        }
        
        if (profileData.containsKey("linkedinUrl")) user.setLinkedinUrl(profileData.get("linkedinUrl"));
        if (profileData.containsKey("githubUrl")) user.setGithubUrl(profileData.get("githubUrl"));
        if (profileData.containsKey("portfolioUrl")) user.setPortfolioUrl(profileData.get("portfolioUrl"));
        if (profileData.containsKey("profileVisibility")) user.setProfileVisibility(profileData.get("profileVisibility"));
        
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public UserExperience addExperience(String email, UserExperience exp) {
        User user = findByEmail(email);
        exp.setUser(user);
        return userExperienceRepository.save(exp);
    }

    @Override
    @Transactional
    public UserExperience updateExperience(Long id, UserExperience exp) {
        UserExperience existing = userExperienceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Experience record not found with ID: " + id));
        
        existing.setCompanyName(exp.getCompanyName());
        existing.setTitle(exp.getTitle());
        existing.setStartDate(exp.getStartDate());
        existing.setEndDate(exp.getEndDate());
        existing.setIsCurrent(exp.getIsCurrent());
        existing.setDescription(exp.getDescription());
        
        return userExperienceRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteExperience(Long id) {
        if (!userExperienceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Experience record not found with ID: " + id);
        }
        userExperienceRepository.deleteById(id);
    }

    @Override
    @Transactional
    public UserEducation addEducation(String email, UserEducation edu) {
        User user = findByEmail(email);
        edu.setUser(user);
        return userEducationRepository.save(edu);
    }

    @Override
    @Transactional
    public UserEducation updateEducation(Long id, UserEducation edu) {
        UserEducation existing = userEducationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Education record not found with ID: " + id));
        
        existing.setInstitution(edu.getInstitution());
        existing.setDegree(edu.getDegree());
        existing.setFieldOfStudy(edu.getFieldOfStudy());
        existing.setStartYear(edu.getStartYear());
        existing.setEndYear(edu.getEndYear());
        existing.setGrade(edu.getGrade());
        
        return userEducationRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteEducation(Long id) {
        if (!userEducationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Education record not found with ID: " + id);
        }
        userEducationRepository.deleteById(id);
    }

    @Override
    public List<UserExperience> getExperiences(String email) {
        return userExperienceRepository.findByUserEmailOrderByStartDateDesc(email);
    }

    @Override
    public List<UserEducation> getEducations(String email) {
        return userEducationRepository.findByUserEmailOrderByStartYearDesc(email);
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.getStatus().equals("ACTIVE"),  // enabled
                true,  // accountNonExpired
                true,  // credentialsNonExpired
                true,  // accountNonLocked
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().getName()))
        );
    }
}
