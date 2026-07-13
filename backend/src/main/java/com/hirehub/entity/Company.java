package com.hirehub.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String industry;

    @Column(length = 100)
    private String website;

    @Column(name = "logo_url", length = 255)
    private String logoUrl;

    @Column(length = 100)
    private String location;

    @Column(name = "cover_photo_url", length = 500)
    private String coverPhotoUrl;

    @Column(length = 50)
    private String size;

    @Column(name = "founded_year")
    private Integer foundedYear;

    @Column(length = 100)
    private String headquarters;

    @Column(name = "culture_description", columnDefinition = "TEXT")
    private String cultureDescription;

    @Column(columnDefinition = "TEXT")
    private String benefits; // JSON array string

    @Column(name = "tech_stack", length = 500)
    private String techStack; // Comma-separated list

    @Column(name = "linkedin_url", length = 255)
    private String linkedinUrl;

    @Column(name = "twitter_url", length = 255)
    private String twitterUrl;

    @Column(name = "glassdoor_rating")
    private BigDecimal glassdoorRating = BigDecimal.ZERO;

    public Company() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCoverPhotoUrl() {
        return coverPhotoUrl;
    }

    public void setCoverPhotoUrl(String coverPhotoUrl) {
        this.coverPhotoUrl = coverPhotoUrl;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public Integer getFoundedYear() {
        return foundedYear;
    }

    public void setFoundedYear(Integer foundedYear) {
        this.foundedYear = foundedYear;
    }

    public String getHeadquarters() {
        return headquarters;
    }

    public void setHeadquarters(String headquarters) {
        this.headquarters = headquarters;
    }

    public String getCultureDescription() {
        return cultureDescription;
    }

    public void setCultureDescription(String cultureDescription) {
        this.cultureDescription = cultureDescription;
    }

    public String getBenefits() {
        return benefits;
    }

    public void setBenefits(String benefits) {
        this.benefits = benefits;
    }

    public String getTechStack() {
        return techStack;
    }

    public void setTechStack(String techStack) {
        this.techStack = techStack;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public String getTwitterUrl() {
        return twitterUrl;
    }

    public void setTwitterUrl(String twitterUrl) {
        this.twitterUrl = twitterUrl;
    }

    public BigDecimal getGlassdoorRating() {
        return glassdoorRating;
    }

    public void setGlassdoorRating(BigDecimal glassdoorRating) {
        this.glassdoorRating = glassdoorRating;
    }
}
