# WeHireNow

A full-stack web application designed to seamlessly connect job seekers with recruiters through a modern, intuitive, and dynamic platform. The system offers dual interfaces, each specifically tailored for two types of users: **Candidates** and **Recruiters**.

---

## Overview

WeHireNow provides a robust environment for job searching, professional networking, and recruitment management. Candidates can create detailed profiles, browse jobs with advanced filters, and apply with ease. Recruiters can manage company profiles, publish job postings, and evaluate applications efficiently.

---

## Core Features

### Candidate Features

- Complete profile creation with personal details, skills, experience, education, and activities  
- Advanced job search with multiple filters (location, contract type, experience level, work mode, industry)  
- Job application system with optional cover letter  
- Application tracking dashboard with workflow statuses (pending, reviewed, accepted, rejected)  
- Profile management including image upload and compression  

### Recruiter Features

- Company profile creation with structured information  
- Job posting system with rich formatting and detailed job attributes  
- Application management dashboard for reviewing candidate submissions  
- Job analytics and performance statistics  
- Evaluation tools supporting real-time status updates  

---

## Technical Architecture

### Frontend

- Vue.js 3 (Composition API)  
- Pinia for state management  
- Vue Router for navigation  
- Custom responsive CSS (mobile-first approach)  

### Backend

- Node.js with Express.js  
- Modular routing and controller structure  
- Secure session-based authentication  
- bcrypt for password hashing  

### Database

- PostgreSQL  
- Combination of relational tables and JSONB fields  
- Efficient querying for filters and advanced searches  

### File Handling

- Image compression  
- Base64 storage strategy for profile pictures  

---

## Key Technical Implementations

- Real-time form validation with client-side feedback  
- Optimized image compression algorithms  
- Advanced PostgreSQL queries using joins and JSONB selectors  
- RESTful API architecture with detailed error handling  
- Reusable UI components and consistent design patterns  
- Secure authentication workflow for both candidates and recruiters  
- Database transactions ensuring reliable relationship management  

---

## Project Structure

WeHireNow/  
├── backend/  
│ ├── src/  
│ │ ├── routes/  
│ │ │ ├── auth.js  
│ │ │ ├── jobs.js  
│ │ │ ├── jobApplications.js  
│ │ │ └── profiles.js  
│ │ └── models/  
│ │ └── db.js  
│ ├── server.js  
│ └── .env  
└── frontend/  
├── src/  
│ ├── components/  
│ │ ├── AddJob.vue  
│ │ ├── ChoseAccount.vue  
│ │ ├── CompanyJob.vue  
│ │ ├── FooterBar.vue  
│ │ ├── HeaderBar.vue  
│ │ ├── FormCandidate.vue  
│ │ ├── FormRecruiter.vue  
│ │ ├── JobApplication.vue  
│ │ ├── JobDetail.vue  
│ │ ├── JobSearch.vue  
│ │ ├── JobStats.vue  
│ │ ├── Login.vue  
│ │ ├── ProfileCandidate.vue  
│ │ ├── ProfileRecruiter.vue  
│ │ ├── RegisterForm.vue  
│ │ ├── ShowJob.vue  
│ │ └── MainPage.vue  
│ ├── stores/  
│ │ └── auth.js  
│ ├── router/  
│ │ └── index.js  
│ ├── services/  
│ │ └── api.js  
│ └── assets/  
│ └── style.css  
├── App.vue  
├── main.js  
├── index.html  
└── package.json  

---
##Database Structure
```
wehirenow_db=# \dt  
                   Liste des tables  
 Schéma |        Nom         | Type  |  Propriétaire  
--------+--------------------+-------+----------------  
 public | candidate_profiles | table | postgres  
 public | job_applications   | table | postgres  
 public | jobs               | table | postgres  
 public | recruiter_profiles | table | postgres  
 public | users              | table | wehirenow_user  
(5 lignes)  


wehirenow_db=# \d users;  
                                            Table ½ public.users ╗  
    Colonne    |            Type             | Collationnement | NULL-able |            Par défaut  
---------------+-----------------------------+-----------------+-----------+-----------------------------------  
 id            | integer                     |                 | not null  | nextval('users_id_seq'::regclass)  
 email         | character varying(255)      |                 | not null  |  
 password_hash | character varying(255)      |                 | not null  |  
 account_type  | character varying(50)       |                 | not null  |  
 created_at    | timestamp without time zone |                 |           | CURRENT_TIMESTAMP  
Index :  
    "users_pkey" PRIMARY KEY, btree (id)  
    "users_email_key" UNIQUE CONSTRAINT, btree (email)  
Référencé par :  
    TABLE "candidate_profiles" CONSTRAINT "candidates_user_id_fkey" FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE  
    TABLE "job_applications" CONSTRAINT "job_applications_user_id_fkey" FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE  
    TABLE "recruiter_profiles" CONSTRAINT "recruiters_user_id_fkey" FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE  


wehirenow_db=# \d jobs;
                                            Table ½ public.jobs ╗
    Colonne    |            Type             | Collationnement | NULL-able |            Par défaut
---------------+-----------------------------+-----------------+-----------+----------------------------------
 id            | integer                     |                 | not null  | nextval('jobs_id_seq'::regclass)
 position      | character varying(255)      |                 | not null  |
 company_name  | character varying(255)      |                 | not null  |
 location      | character varying(255)      |                 |           |
 contract_type | character varying(100)      |                 |           |
 level         | character varying(100)      |                 |           |
 time_type     | character varying(100)      |                 |           |
 work_mode     | character varying(100)      |                 |           |
 field         | character varying(100)      |                 |           |
 salary_range  | character varying(100)      |                 |           |
 description   | text                        |                 |           |
 requirements  | text                        |                 |           |
 benefits      | text                        |                 |           |
 created_at    | timestamp without time zone |                 |           | now()
 name          | character varying(255)      |                 |           |
Index :
    "jobs_pkey" PRIMARY KEY, btree (id)
Référencé par :
    TABLE "job_applications" CONSTRAINT "job_applications_job_id_fkey" FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE


wehirenow_db=# \d job_applications;
                                              Table ½ public.job_applications ╗
     Colonne      |            Type             | Collationnement | NULL-able |                  Par défaut             
------------------+-----------------------------+-----------------+-----------+----------------------------------------------
 id               | integer                     |                 | not null  | nextval('job_applications_id_seq'::regclass)
 user_id          | integer                     |                 |           |
 job_id           | integer                     |                 |           |
 status           | character varying(50)       |                 |           | 'pending'::character varying
 application_date | timestamp without time zone |                 |           | CURRENT_TIMESTAMP
 cover_letter     | text                        |                 |           |
 updated_at       | timestamp without time zone |                 |           | CURRENT_TIMESTAMP
Index :
    "job_applications_pkey" PRIMARY KEY, btree (id)
    "job_applications_user_id_job_id_key" UNIQUE CONSTRAINT, btree (user_id, job_id)
Contraintes de vérification :
    "job_applications_status_check" CHECK (status::text = ANY (ARRAY['pending'::character varying, 'reviewed'::character varying, 'accepted'::character varying, 'rejected'::character varying]::text[]))
Contraintes de clés étrangères :
    "job_applications_job_id_fkey" FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    "job_applications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE


                                           Table ½ public.recruiter_profiles ╗
       Colonne       |            Type             | Collationnement | NULL-able |               Par défaut             
---------------------+-----------------------------+-----------------+-----------+----------------------------------------
 id                  | integer                     |                 | not null  | nextval('recruiters_id_seq'::regclass)
 user_id             | integer                     |                 | not null  |
 first_name          | character varying(100)      |                 |           |
 last_name           | character varying(100)      |                 |           |
 position            | character varying(100)      |                 |           |
 profile_picture     | text                        |                 |           |
 bio                 | text                        |                 |           |
 phone               | character varying(20)       |                 |           |
 linkedin            | character varying(255)      |                 |           |
 work_email          | character varying(255)      |                 |           |
 company_name        | character varying(255)      |                 |           |
 company_website     | character varying(255)      |                 |           |
 industry            | character varying(100)      |                 |           |
 company_size        | character varying(50)       |                 |           |
 annual_revenue      | character varying(50)       |                 |           |
 company_description | text                        |                 |           |
 company_location    | character varying(255)      |                 |           |
 founded_year        | integer                     |                 |           |
 hiring_roles        | text[]                      |                 |           |
 skills              | text[]                      |                 |           |
 hiring_process      | text                        |                 |           |
 company_benefits    | text[]                      |                 |           |
 additional_benefits | text                        |                 |           |
 created_at          | timestamp without time zone |                 |           | CURRENT_TIMESTAMP
 updated_at          | timestamp without time zone |                 |           | CURRENT_TIMESTAMP
Index :
    "recruiters_pkey" PRIMARY KEY, btree (id)
    "idx_recruiters_company_name" btree (company_name)
    "idx_recruiters_industry" btree (industry)
    "idx_recruiters_user_id" btree (user_id)
    "recruiters_user_id_key" UNIQUE CONSTRAINT, btree (user_id)
Contraintes de clés étrangères :
    "recruiters_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE



wehirenow_db=# \d candidate_profiles;
                                         Table ½ public.candidate_profiles ╗
     Colonne     |            Type             | Collationnement | NULL-able |               Par défaut
-----------------+-----------------------------+-----------------+-----------+----------------------------------------
 id              | integer                     |                 | not null  | nextval('candidates_id_seq'::regclass)
 user_id         | integer                     |                 | not null  |
 first_name      | character varying(100)      |                 |           |
 last_name       | character varying(100)      |                 |           |
 profile_picture | text                        |                 |           |
 bio             | text                        |                 |           |
 phone           | character varying(20)       |                 |           |
 linkedin        | character varying(255)      |                 |           |
 github          | character varying(255)      |                 |           |
 skills          | text[]                      |                 |           |
 experiences     | jsonb                       |                 |           | '[]'::jsonb
 educations      | jsonb                       |                 |           | '[]'::jsonb
 activities      | jsonb                       |                 |           | '[]'::jsonb
 created_at      | timestamp without time zone |                 |           | CURRENT_TIMESTAMP
 updated_at      | timestamp without time zone |                 |           | CURRENT_TIMESTAMP
Index :
    "candidates_pkey" PRIMARY KEY, btree (id)
    "candidates_user_id_key" UNIQUE CONSTRAINT, btree (user_id)
    "idx_candidates_skills" gin (skills)
    "idx_candidates_user_id" btree (user_id)
Contraintes de clés étrangères :
    "candidates_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE







        constraint_name        |     table_from     |                    constraint_definition
-------------------------------+--------------------+--------------------------------------------------------------
 candidates_user_id_fkey       | candidate_profiles | FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
 job_applications_user_id_fkey | job_applications   | FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
 job_applications_job_id_fkey  | job_applications   | FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
 recruiters_user_id_fkey       | recruiter_profiles | FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
```


---

---

## API Endpoints

### Authentication

- **POST /api/auth/register**  
  Register a new user

- **POST /api/auth/login**  
  Login user

- **POST /api/auth/logout**  
  Logout user

---

### Profile Management

- **POST /api/profile/save**  
  Save or update a profile

- **GET /api/profile/:email**  
  Retrieve profile by email

- **DELETE /api/profile/:email**  
  Delete a profile

---

### Job Management

- **GET /api/jobs**  
  Get all jobs

- **GET /api/jobs/:id**  
  Get job by ID

- **POST /api/jobs**  
  Create a job

- **PUT /api/jobs/:id**  
  Update a job

- **DELETE /api/jobs/:id**  
  Delete a job

- **GET /api/jobs/search**  
  Search jobs with filters

---

### Job Applications

- **GET /api/applications**  
  Get user's applications

- **POST /api/applications**  
  Create a new application

- **PUT /api/applications/:id**  
  Update application status

- **DELETE /api/applications/:id**  
  Delete an application

- **GET /api/applications/job/:jobId**  
  Get all applications for a job

---

## Installation and Setup

### Prerequisites

- Node.js (v16 or higher)  
- PostgreSQL (v12 or higher)  
- npm or yarn

---

## Backend Setup

1. Navigate to the backend directory  
2. Install dependencies:  
   ```bash
   npm install
   ```

3. Create a .env file based on .env.example

4. Set up the PostgreSQL database:

```
createdb wehirenow_db
psql -U postgres -d wehirenow_db -f schema.sql
```

5. Start the server:
```
npm start
```

## Frontend Setup

1. Navigate to the frontend directory
```
cd ./frontend
```

2. Install dependencies:
```
npm install
```

3.Configure the API base URL in services/api.js

4.Start the development server:
```
npm run dev
```
## Environment Variables

1. Create a .env file in the backend directory:
```
DB_HOST=localhost
DB_USER=wehirenow_user
DB_PASSWORD=your_password
DB_NAME=wehirenow_db
DB_PORT=5432
SESSION_SECRET=your_session_secret
NODE_ENV=development
```

---
## Development Features

---

### Form Validation

- Real-time client-side validation
- Server-side validation with meaningful error messages
- Required field highlighting
- File type and size validation for images

---

### Image Processing

- Automatic image compression (max 400px width)
- Base64 encoding for database storage
- File size limit: 500KB
- Support for common image formats

---

### Search Functionality

- Multi-criteria filtering
- Keyword search across multiple fields
- Location-based filtering
- Industry and job type filters

---

### Application Workflow

- Four-stage application status: pending, reviewed, accepted, rejected
- Application tracking dashboard
- Real-time status updates
- Cover letter support

---

### Security Features

- Password hashing with bcrypt
- Session-based authentication
- SQL injection prevention through parameterized queries
- Input sanitization and validation
- Secure file upload handling
- CORS configuration for frontend-backend communication

---

### Performance Optimizations

- Image compression for faster loading
- Database indexing for frequently queried fields
- Efficient JSONB queries for array data
- Client-side caching for user sessions
- Optimized database joins for complex queries
