-- Insert roles
INSERT INTO roles (id, name) VALUES (1, 'ROLE_JOBSEEKER');
INSERT INTO roles (id, name) VALUES (2, 'ROLE_RECRUITER');
INSERT INTO roles (id, name) VALUES (3, 'ROLE_ADMIN');

-- Insert initial users (Password is 'password' BCrypt hashed: $2a$10$8K1p/aPqf/530h7k6V/gK.K0C/8w/XbH56PzK0N7x9nS.U5sH6f3W)
-- Admin
INSERT INTO users (id, email, password, full_name, role_id, status, phone, headline, bio, profile_photo_url, location, experience_years, linkedin_url, github_url, portfolio_url) 
VALUES (1, 'admin@hirehub.in', '$2a$10$A2nPyGsTY8E1nrnzDA8UVubagqctR4aGpNLuqRN2Wie3oqvkJmSmG', 'Platform Administrator', 3, 'ACTIVE', '+919876543210', 'Systems & Platform Administrator', 'Overseeing system integrity, security policies, and user accounts.', '/images/avatars/default-avatar.png', 'Bengaluru, KA', 8, 'https://linkedin.com', 'https://github.com', 'https://portfolio.com');

-- Recruiters
INSERT INTO users (id, email, password, full_name, role_id, status, phone, headline, bio, profile_photo_url, location, experience_years, linkedin_url, github_url, portfolio_url) 
VALUES (2, 'recruiter1@tcs.com', '$2a$10$A2nPyGsTY8E1nrnzDA8UVubagqctR4aGpNLuqRN2Wie3oqvkJmSmG', 'Rahul Sharma', 2, 'ACTIVE', '+919876511111', 'Senior Tech Recruiter @ TCS', 'Helping talented backend developers and software engineers find their dream jobs.', '/images/avatars/default-avatar.png', 'Pune, MH', 5, 'https://linkedin.com/in/rahulsharma-tcs', '', '');

INSERT INTO users (id, email, password, full_name, role_id, status, phone, headline, bio, profile_photo_url, location, experience_years, linkedin_url, github_url, portfolio_url) 
VALUES (3, 'recruiter2@infosys.com', '$2a$10$A2nPyGsTY8E1nrnzDA8UVubagqctR4aGpNLuqRN2Wie3oqvkJmSmG', 'Priya Patel', 2, 'ACTIVE', '+919876522222', 'Talent Acquisition Partner @ Infosys', 'Sourcing innovators for Cloud & DevOps teams globally.', '/images/avatars/default-avatar.png', 'Bengaluru, KA', 6, 'https://linkedin.com/in/priyapatel-infy', '', '');

INSERT INTO users (id, email, password, full_name, role_id, status, phone, headline, bio, profile_photo_url, location, experience_years, linkedin_url, github_url, portfolio_url) 
VALUES (7, 'recruiter3@flipkart.com', '$2a$10$A2nPyGsTY8E1nrnzDA8UVubagqctR4aGpNLuqRN2Wie3oqvkJmSmG', 'Vikram Singh', 2, 'ACTIVE', '+919876533333', 'Lead Recruiter @ Flipkart', 'Hiring Software Developers for cloud infrastructure teams.', '/images/avatars/default-avatar.png', 'Bengaluru, KA', 4, 'https://linkedin.com', '', '');

INSERT INTO users (id, email, password, full_name, role_id, status, phone, headline, bio, profile_photo_url, location, experience_years, linkedin_url, github_url, portfolio_url) 
VALUES (8, 'recruiter4@zomato.com', '$2a$10$A2nPyGsTY8E1nrnzDA8UVubagqctR4aGpNLuqRN2Wie3oqvkJmSmG', 'Neha Gupta', 2, 'ACTIVE', '+919876544444', 'University Recruiter @ Zomato', 'Connecting student engineers with internship opportunities.', '/images/avatars/default-avatar.png', 'Gurugram, HR', 3, 'https://linkedin.com', '', '');

-- Job Seekers
INSERT INTO users (id, email, password, full_name, role_id, status, phone, headline, bio, profile_photo_url, location, experience_years, linkedin_url, github_url, portfolio_url) 
VALUES (4, 'jobseeker1@gmail.com', '$2a$10$A2nPyGsTY8E1nrnzDA8UVubagqctR4aGpNLuqRN2Wie3oqvkJmSmG', 'Arjun Kumar', 1, 'ACTIVE', '+919876599999', 'Senior Java Developer | Spring Boot expert', 'Passionate backend developer with 3+ years of experience designing robust databases, RESTful APIs, and microservice architectures.', '/images/avatars/default-avatar.png', 'Hyderabad, TS', 3, 'https://linkedin.com/in/arjun-kumar', 'https://github.com/arjun-kumar', 'https://arjunkumar.dev');

INSERT INTO users (id, email, password, full_name, role_id, status, phone, headline, bio, profile_photo_url, location, experience_years, linkedin_url, github_url, portfolio_url) 
VALUES (5, 'jobseeker2@gmail.com', '$2a$10$A2nPyGsTY8E1nrnzDA8UVubagqctR4aGpNLuqRN2Wie3oqvkJmSmG', 'Ananya Verma', 1, 'ACTIVE', '+919876588888', 'Frontend Developer | React.js Specialist', 'UI developer who loves building pixel-perfect, accessible, and fast web applications using React, HTML/CSS, and Javascript.', '/images/avatars/default-avatar.png', 'Mumbai, MH', 2, 'https://linkedin.com/in/ananya-verma', 'https://github.com/ananya-verma', 'https://ananyaverma.design');

INSERT INTO users (id, email, password, full_name, role_id, status, phone, headline, bio, profile_photo_url, location, experience_years, linkedin_url, github_url, portfolio_url) 
VALUES (6, 'blockedseeker@gmail.com', '$2a$10$A2nPyGsTY8E1nrnzDA8UVubagqctR4aGpNLuqRN2Wie3oqvkJmSmG', 'Bad User', 1, 'BLOCKED', '+919999999999', 'Spam User account', 'Blocked profile.', '/images/avatars/default-avatar.png', 'Unknown', 0, '', '', '');

-- Insert Companies
INSERT INTO companies (id, name, description, industry, website, logo_url, location, cover_photo_url, size, founded_year, headquarters, culture_description, benefits, tech_stack, linkedin_url, twitter_url, glassdoor_rating)
VALUES (1, 'TCS', 'Tata Consultancy Services is an IT services, consulting and business solutions organization.', 'Technology', 'https://www.tcs.com', 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg', 'Mumbai, MH', '/images/companies/google-office.png', '10,000+', 1968, 'Mumbai, MH', 'Focus on continuous learning, innovation, and global collaboration.', '["Health Insurance", "Hybrid Working Option", "Retirement Benefits", "Gym Membership"]', 'Java,Python,Angular,React,Cloud', 'https://linkedin.com/company/tcs', 'https://twitter.com/tcs', 3.9);

INSERT INTO companies (id, name, description, industry, website, logo_url, location, cover_photo_url, size, founded_year, headquarters, culture_description, benefits, tech_stack, linkedin_url, twitter_url, glassdoor_rating)
VALUES (2, 'Infosys', 'Infosys is a global leader in next-generation digital services and consulting.', 'Technology', 'https://www.infosys.com', 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg', 'Bengaluru, KA', '/images/companies/microsoft-office.png', '10,000+', 1981, 'Bengaluru, KA', 'A culture of innovation, driving digital transformation for global clients.', '["Health Insurance", "Relocation Assistance", "Education Assistance", "Paid Time Off"]', 'Java,.NET,Spring Boot,React,SQL', 'https://linkedin.com/company/infosys', 'https://twitter.com/infosys', 3.8);

INSERT INTO companies (id, name, description, industry, website, logo_url, location, cover_photo_url, size, founded_year, headquarters, culture_description, benefits, tech_stack, linkedin_url, twitter_url, glassdoor_rating)
VALUES (3, 'Flipkart', 'India''s leading e-commerce marketplace offering over 30 million products.', 'E-commerce', 'https://www.flipkart.com', 'https://upload.wikimedia.org/wikipedia/en/7/7a/Flipkart_logo.svg', 'Bengaluru, KA', '/images/companies/amazon-office.png', '10,000+', 2007, 'Bengaluru, KA', 'Fast-paced, bold, and focused on maximizing customer impact.', '["Employee Discounts", "Health Benefits", "Stock Options", "Flexible Working"]', 'Java,Python,MySQL,Docker,Kubernetes,React', 'https://linkedin.com/company/flipkart', 'https://twitter.com/flipkart', 4.1);

INSERT INTO companies (id, name, description, industry, website, logo_url, location, cover_photo_url, size, founded_year, headquarters, culture_description, benefits, tech_stack, linkedin_url, twitter_url, glassdoor_rating)
VALUES (4, 'Zomato', 'Connecting people with great food around them.', 'Food Tech', 'https://www.zomato.com', 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Zomato_logo.png', 'Gurugram, HR', '/images/companies/meta-office.png', '5,000+', 2008, 'Gurugram, HR', 'Dynamic, founder-driven culture focusing on speed and execution.', '["Free Meals", "Wellness Stipend", "Unlimited PTO", "Parental Support"]', 'PHP,React,Python,MySQL,React Native', 'https://linkedin.com/company/zomato', 'https://twitter.com/zomato', 4.0);

-- Insert Recruiters Link
INSERT INTO recruiters (id, user_id, company_id, position) VALUES (1, 2, 1, 'Senior Technical Recruiter');
INSERT INTO recruiters (id, user_id, company_id, position) VALUES (2, 3, 2, 'Talent Acquisition Manager');
INSERT INTO recruiters (id, user_id, company_id, position) VALUES (3, 7, 3, 'Engineering Recruiting Lead');
INSERT INTO recruiters (id, user_id, company_id, position) VALUES (4, 8, 4, 'Tech Staffing Specialist');

-- Insert Jobs
INSERT INTO jobs (id, recruiter_id, company_id, title, description, requirements, location, job_type, salary_range, status)
VALUES (1, 1, 1, 'Senior Software Engineer (Backend)', 'We are looking for a Senior Java Developer to work on our banking solutions. You will build highly scalable APIs using Spring Boot, Hibernate, and Kubernetes.', 'Java,Spring Boot,MySQL,Microservices,Kubernetes', 'Remote / Pune', 'FULL_TIME', '₹15,00,000 - ₹25,00,000', 'OPEN');

INSERT INTO jobs (id, recruiter_id, company_id, title, description, requirements, location, job_type, salary_range, status)
VALUES (2, 1, 1, 'Frontend Developer (React)', 'Join our UI/UX team to build next-generation interfaces. You should have a deep understanding of React.js, React Router, state management, and modern CSS/Tailwind.', 'React,Javascript,HTML,CSS,Redux', 'Mumbai, MH', 'FULL_TIME', '₹8,00,000 - ₹14,00,000', 'OPEN');

INSERT INTO jobs (id, recruiter_id, company_id, title, description, requirements, location, job_type, salary_range, status)
VALUES (3, 2, 2, 'Full Stack Engineer', 'Looking for a full stack engineer capable of managing both react frontends and spring boot backends. Database experience with MySQL is essential.', 'Java,Spring Boot,React,MySQL,HTML,CSS', 'Bengaluru, KA', 'FULL_TIME', '₹12,00,000 - ₹18,00,000', 'OPEN');

INSERT INTO jobs (id, recruiter_id, company_id, title, description, requirements, location, job_type, salary_range, status)
VALUES (4, 2, 2, 'Data Analyst Intern', 'We are looking for a data analyst intern to work with our PowerBI and SQL dashboard systems.', 'SQL,Python,PowerBI,Excel', 'Remote', 'CONTRACT', '₹20,000 - ₹30,000 / month', 'OPEN');

INSERT INTO jobs (id, recruiter_id, company_id, title, description, requirements, location, job_type, salary_range, status)
VALUES (5, 3, 3, 'Cloud Infrastructure Engineer', 'Join Flipkart''s Cloud team. You will build, support, and automate systems using Terraform, AWS, and python.', 'AWS,Python,Docker,Linux,Kubernetes', 'Bengaluru, KA', 'FULL_TIME', '₹18,00,000 - ₹30,00,000', 'OPEN');

INSERT INTO jobs (id, recruiter_id, company_id, title, description, requirements, location, job_type, salary_range, status)
VALUES (6, 4, 4, 'React Native Mobile Developer', 'Help us build mobile features for our delivery app. Strong UI prototyping and React Native skills required.', 'React Native,Javascript,CSS,iOS,Android', 'Gurugram, HR', 'REMOTE', '₹14,00,000 - ₹22,00,000', 'OPEN');

-- Insert Skills
INSERT INTO skills (id, name) VALUES (1, 'Java');
INSERT INTO skills (id, name) VALUES (2, 'Spring Boot');
INSERT INTO skills (id, name) VALUES (3, 'React');
INSERT INTO skills (id, name) VALUES (4, 'MySQL');
INSERT INTO skills (id, name) VALUES (5, 'Microservices');
INSERT INTO skills (id, name) VALUES (6, 'Kubernetes');
INSERT INTO skills (id, name) VALUES (7, 'Javascript');
INSERT INTO skills (id, name) VALUES (8, 'HTML');
INSERT INTO skills (id, name) VALUES (9, 'CSS');
INSERT INTO skills (id, name) VALUES (10, 'Python');
INSERT INTO skills (id, name) VALUES (11, 'SQL');

-- Associate Skills with Job Seekers
INSERT INTO user_skills (user_id, skill_id) VALUES (4, 1); -- Arjun has Java
INSERT INTO user_skills (user_id, skill_id) VALUES (4, 2); -- Arjun has Spring Boot
INSERT INTO user_skills (user_id, skill_id) VALUES (4, 4); -- Arjun has MySQL
INSERT INTO user_skills (user_id, skill_id) VALUES (5, 3); -- Ananya has React
INSERT INTO user_skills (user_id, skill_id) VALUES (5, 7); -- Ananya has Javascript
INSERT INTO user_skills (user_id, skill_id) VALUES (5, 8); -- Ananya has HTML
INSERT INTO user_skills (user_id, skill_id) VALUES (5, 9); -- Ananya has CSS

-- Resumes for Job Seekers
INSERT INTO resumes (id, user_id, file_name, file_type, parsed_text, ai_score, ai_analysis)
VALUES (1, 4, 'arjun_kumar_backend_resume.pdf', 'application/pdf', 'Arjun Kumar. Backend Java Engineer. Skills: Java, Spring Boot, MySQL, REST APIs, Microservices, Git. Experience: 3 years. Education: B.Tech in CS.', 85, '{"overall_rating": "Strong Candidate", "ATS_match_percentage": 85, "strengths": ["Excellent knowledge of backend Java ecosystem", "Hands-on Spring Boot experience", "Database query optimization with MySQL"], "gaps": ["No Kubernetes mentioned", "Could add containerization experience"], "career_recommendations": ["Learn Docker and Kubernetes", "Add active GitHub projects link"]}');

INSERT INTO resumes (id, user_id, file_name, file_type, parsed_text, ai_score, ai_analysis)
VALUES (2, 5, 'ananya_verma_frontend_resume.pdf', 'application/pdf', 'Ananya Verma. UI/UX and React Developer. Skills: React, JS, HTML, CSS, Bootstrap, Figma. Experience: 2 years. Education: B.Tech in IT.', 78, '{"overall_rating": "Good Candidate", "ATS_match_percentage": 78, "strengths": ["Solid foundation in core React and web standards", "Good UI styling experience"], "gaps": ["Lacks backend integration skills", "No automated testing mentioned"], "career_recommendations": ["Learn Redux Toolkit and React Query", "Basic Node.js or Spring Boot API integration"]}');

-- Applications
INSERT INTO applications (id, job_id, user_id, resume_id, status, cover_letter, score)
VALUES (1, 1, 4, 1, 'SHORTLISTED', 'Dear Rahul, I am very excited about the Senior Software Engineer position at TCS. I have 3 years of experience building Java APIs.', 85);

INSERT INTO applications (id, job_id, user_id, resume_id, status, cover_letter, score)
VALUES (2, 2, 5, 2, 'APPLIED', 'Hi! I love designing beautiful interfaces in React. Hope to hear back soon!', 78);

-- Notifications
INSERT INTO notifications (id, user_id, message, is_read)
VALUES (1, 4, 'Your application for Senior Software Engineer (Backend) at TCS has been Shortlisted!', false);
INSERT INTO notifications (id, user_id, message, is_read)
VALUES (2, 5, 'You successfully applied for Frontend Developer (React) at TCS.', true);

-- Interviews
INSERT INTO interviews (id, application_id, interview_date, location_or_link, notes, status)
VALUES (1, 1, '2026-07-15 14:00:00', 'https://meet.google.com/abc-defg-hij', 'Initial technical assessment covering Java concurrency, Spring Boot DI, and microservices.', 'SCHEDULED');

-- Saved Jobs Seed
INSERT INTO saved_jobs (user_id, job_id) VALUES (4, 3);
INSERT INTO saved_jobs (user_id, job_id) VALUES (5, 2);

-- Experiences Seed
INSERT INTO user_experiences (user_id, company_name, title, start_date, end_date, is_current, description)
VALUES (4, 'Tech Mahindra', 'Software Developer', '2023-06-01', '2025-05-15', false, 'Worked on developing microservices using Java and Spring Boot. Maintained databases and improved code quality.');
INSERT INTO user_experiences (user_id, company_name, title, start_date, end_date, is_current, description)
VALUES (4, 'Wipro', 'Junior Engineer', '2022-01-10', '2023-05-30', false, 'Assisted in building REST APIs and bug fixing. Participated in scrum meetings.');
INSERT INTO user_experiences (user_id, company_name, title, start_date, end_date, is_current, description)
VALUES (5, 'Pixel Perfect UI', 'Web Developer', '2024-03-01', NULL, true, 'Responsible for converting Figma designs into high quality React components. Optimized frontend performance.');

-- Education Seed
INSERT INTO user_education (user_id, institution, degree, field_of_study, start_year, end_year, grade)
VALUES (4, 'IIT Bombay', 'Bachelor of Technology', 'Computer Science', 2018, 2022, '8.8 CGPA');
INSERT INTO user_education (user_id, institution, degree, field_of_study, start_year, end_year, grade)
VALUES (5, 'NIT Trichy', 'Bachelor of Technology', 'Information Technology', 2020, 2024, '8.5 CGPA');
