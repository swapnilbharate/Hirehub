-- Drop tables if they exist (ordered by dependencies)
DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS user_skills;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS resumes;
DROP TABLE IF EXISTS saved_jobs;
DROP TABLE IF EXISTS user_experiences;
DROP TABLE IF EXISTS user_education;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS recruiters;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

-- 1. Roles table
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Users table (enhanced with profile features)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role_id INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, BLOCKED
    phone VARCHAR(20),
    headline VARCHAR(200),
    bio TEXT,
    profile_photo_url LONGTEXT,
    location VARCHAR(100),
    experience_years INT DEFAULT 0,
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    profile_visibility VARCHAR(20) DEFAULT 'PUBLIC', -- PUBLIC, PRIVATE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 3. Companies table (enhanced with culture & branding)
CREATE TABLE companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    website VARCHAR(100),
    logo_url VARCHAR(255),
    location VARCHAR(100),
    cover_photo_url VARCHAR(500),
    size VARCHAR(50),
    founded_year INT,
    headquarters VARCHAR(100),
    culture_description TEXT,
    benefits TEXT, -- Comma-separated list or descriptions
    tech_stack VARCHAR(500), -- Comma-separated list of tech
    linkedin_url VARCHAR(255),
    twitter_url VARCHAR(255),
    glassdoor_rating DECIMAL(3,1) DEFAULT 0.0
);

-- 4. Recruiters table
CREATE TABLE recruiters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    company_id BIGINT,
    position VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

-- 5. Jobs table
CREATE TABLE jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recruiter_id BIGINT NOT NULL,
    company_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT, -- Comma-separated list of skills required
    location VARCHAR(100) NOT NULL,
    job_type VARCHAR(50) NOT NULL, -- FULL_TIME, PART_TIME, CONTRACT, REMOTE
    salary_range VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN', -- OPEN, CLOSED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES recruiters(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 6. Resumes table
CREATE TABLE resumes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    parsed_text TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ai_score INT DEFAULT 0,
    ai_analysis TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Applications table
CREATE TABLE applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    resume_id BIGINT,
    status VARCHAR(50) NOT NULL DEFAULT 'APPLIED', -- APPLIED, SHORTLISTED, REJECTED, INTERVIEW_SCHEDULED
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cover_letter TEXT,
    score INT DEFAULT 0, -- ATS compatibility score
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL
);

-- 8. Skills table
CREATE TABLE skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 9. User Skills table (Many-to-Many)
CREATE TABLE user_skills (
    user_id BIGINT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- 10. Notifications table
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message VARCHAR(255) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. Interviews table
CREATE TABLE interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    interview_date TIMESTAMP NOT NULL,
    location_or_link VARCHAR(255) NOT NULL,
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, COMPLETED, CANCELLED
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- 12. Saved Jobs (Bookmarks)
CREATE TABLE saved_jobs (
    user_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, job_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- 13. User Experiences (Resume Details)
CREATE TABLE user_experiences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    title VARCHAR(100) NOT NULL,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 14. User Education (Resume Details)
CREATE TABLE user_education (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    institution VARCHAR(150) NOT NULL,
    degree VARCHAR(100),
    field_of_study VARCHAR(100),
    start_year INT,
    end_year INT,
    grade VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
