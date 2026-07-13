package com.hirehub.controller;

import com.hirehub.entity.Company;
import com.hirehub.entity.Job;
import com.hirehub.repository.CompanyRepository;
import com.hirehub.repository.JobRepository;
import com.hirehub.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private JobRepository jobRepository;

    // Get all companies
    @GetMapping
    public ResponseEntity<List<Company>> getAllCompanies() {
        return ResponseEntity.ok(companyRepository.findAll());
    }

    // Get company details by id
    @GetMapping("/{id}")
    public ResponseEntity<Company> getCompanyById(@PathVariable Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + id));
        return ResponseEntity.ok(company);
    }

    // Get all open jobs for a company
    @GetMapping("/{id}/jobs")
    public ResponseEntity<List<Job>> getJobsByCompany(@PathVariable Long id) {
        if (!companyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Company not found with ID: " + id);
        }
        List<Job> jobs = jobRepository.findByCompanyIdAndStatus(id, "OPEN");
        return ResponseEntity.ok(jobs);
    }
}
