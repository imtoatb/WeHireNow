const { Pool } = require('pg');

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'wehirenow_user',
  password: process.env.DB_PASSWORD || 'mdp',
  database: process.env.DB_NAME || 'wehirenow_db',
  port: Number(process.env.DB_PORT) || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('PostgreSQL connection error:', err.message);
  } else {
    console.log('Connected to PostgreSQL, server time:', res.rows[0].now);
  }
});

// Fonctions pour les jobs
const jobQueries = {
  // Créer un job
  async createJob(jobData) {
    try {
      console.log('DB: Creating job:', jobData.name || jobData.position);
      
      const query = `
        INSERT INTO jobs 
        (name, position, company_name, location, description, contract_type, level, 
         time_type, work_mode, field, salary_range, requirements, benefits)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        jobData.name || jobData.position,
        jobData.position,
        jobData.company_name,
        jobData.location || '',
        jobData.description || '',
        jobData.contract_type || '',
        jobData.level || '',
        jobData.time_type || '',
        jobData.work_mode || '',
        jobData.field || '',
        jobData.salary_range || '',
        jobData.requirements || '',
        jobData.benefits || ''
      ]);
      
      console.log(`DB: Job created with ID: ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error) {
      console.error('DB Error creating job:', error.message);
      throw error;
    }
  },

  // Mettre à jour un job
  async updateJob(jobId, jobData) {
    try {
      console.log(`DB: Updating job ${jobId}`);
      
      const query = `
        UPDATE jobs SET
          name = COALESCE($1, name),
          position = COALESCE($2, position),
          company_name = COALESCE($3, company_name),
          location = COALESCE($4, location),
          description = COALESCE($5, description),
          contract_type = COALESCE($6, contract_type),
          level = COALESCE($7, level),
          time_type = COALESCE($8, time_type),
          work_mode = COALESCE($9, work_mode),
          field = COALESCE($10, field),
          salary_range = COALESCE($11, salary_range),
          requirements = COALESCE($12, requirements),
          benefits = COALESCE($13, benefits),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $14
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        jobData.name,
        jobData.position,
        jobData.company_name,
        jobData.location,
        jobData.description,
        jobData.contract_type,
        jobData.level,
        jobData.time_type,
        jobData.work_mode,
        jobData.field,
        jobData.salary_range,
        jobData.requirements,
        jobData.benefits,
        jobId
      ]);
      
      return result.rows[0];
    } catch (error) {
      console.error('DB Error updating job:', error.message);
      throw error;
    }
  },

  // Supprimer un job
  async deleteJob(jobId) {
    try {
      console.log(`DB: Deleting job: ${jobId}`);
      const query = 'DELETE FROM jobs WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [jobId]);
      return result.rows[0];
    } catch (error) {
      console.error('DB Error deleting job:', error.message);
      throw error;
    }
  },

  // Récupérer tous les jobs
  async getAllJobs(showExpired = false) {
    try {
      console.log('DB: Getting all jobs, showExpired:', showExpired);
      
      let sql = "SELECT * FROM jobs WHERE 1=1";
      
      // Si showExpired n'est pas true, filtrer les jobs de plus de 3 mois
      if (!showExpired) {
        sql += ` AND created_at > CURRENT_TIMESTAMP - INTERVAL '3 months'`;
      }
      
      sql += " ORDER BY created_at DESC";
      
      const result = await pool.query(sql);
      console.log(`DB: Found ${result.rows.length} jobs`);
      return result.rows;
    } catch (error) {
      console.error('DB Error getting all jobs:', error.message);
      throw error;
    }
  },

  // Récupérer un job par ID
  async getJobById(jobId) {
    try {
      console.log(`DB: Getting job by ID: ${jobId}`);
      const query = 'SELECT * FROM jobs WHERE id = $1';
      const result = await pool.query(query, [jobId]);
      return result.rows[0];
    } catch (error) {
      console.error('DB Error getting job by ID:', error.message);
      throw error;
    }
  },

  // Rechercher des jobs avec filtres
  async searchJobs(filters) {
    try {
      console.log('DB: Searching jobs with filters:', filters);
      
      let sql = "SELECT * FROM jobs WHERE 1=1";
      const params = [];
      let index = 1;

      const addInClause = (field, values) => {
        if (values && values.length > 0) {
          const placeholders = values.map(() => `$${index++}`).join(",");
          sql += ` AND ${field} IN (${placeholders})`;
          params.push(...values);
        }
      };

      addInClause("contract_type", filters.contractTypes);
      addInClause("level", filters.levels);
      addInClause("time_type", filters.timeTypes);
      addInClause("work_mode", filters.workModes);
      addInClause("field", filters.fields);

      if (filters.area) {
        sql += ` AND location ILIKE $${index++}`;
        params.push(`%${filters.area}%`);
      }

      if (filters.keywords) {
        sql += ` AND (position ILIKE $${index} OR name ILIKE $${index} OR description ILIKE $${index + 1})`;
        params.push(`%${filters.keywords}%`, `%${filters.keywords}%`);
        index += 2;
      }

      // Si showExpired n'est pas true, filtrer les jobs de plus de 3 mois
      if (filters.showExpired !== true && filters.showExpired !== 'true') {
        sql += ` AND created_at > CURRENT_TIMESTAMP - INTERVAL '3 months'`;
      }

      sql += " ORDER BY created_at DESC";

      const result = await pool.query(sql, params);
      console.log(`DB: Found ${result.rows.length} jobs`);
      return result.rows;
    } catch (error) {
      console.error('DB Error searching jobs:', error.message);
      throw error;
    }
  },

  // Vérifier si un job est expiré (plus de 3 mois)
  async isJobExpired(jobId) {
    try {
      console.log(`DB: Checking if job ${jobId} is expired`);
      const query = `
        SELECT 
          id,
          created_at,
          created_at < CURRENT_TIMESTAMP - INTERVAL '3 months' as is_expired
        FROM jobs 
        WHERE id = $1
      `;
      const result = await pool.query(query, [jobId]);
      return result.rows[0]?.is_expired || false;
    } catch (error) {
      console.error('DB Error checking if job is expired:', error.message);
      throw error;
    }
  },

  // Récupérer les statistiques des jobs
  async getJobStats() {
    try {
      console.log('DB: Getting job statistics');
      
      const query = `
        SELECT 
          COUNT(*) as total_jobs,
          COUNT(CASE WHEN created_at > CURRENT_TIMESTAMP - INTERVAL '3 months' THEN 1 END) as active_jobs,
          COUNT(CASE WHEN created_at <= CURRENT_TIMESTAMP - INTERVAL '3 months' THEN 1 END) as expired_jobs,
          COUNT(CASE WHEN created_at > CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 1 END) as recent_jobs
        FROM jobs
      `;
      
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('DB Error getting job stats:', error.message);
      throw error;
    }
  },

  // Récupérer les jobs par compagnie
  async getJobsByCompany(companyName) {
    try {
      console.log(`DB: Getting jobs by company: ${companyName}`);
      const query = `
        SELECT * FROM jobs 
        WHERE company_name ILIKE $1 
        ORDER BY created_at DESC
      `;
      const result = await pool.query(query, [`%${companyName}%`]);
      return result.rows;
    } catch (error) {
      console.error('DB Error getting jobs by company:', error.message);
      throw error;
    }
  },

  // Récupérer les jobs récents (7 derniers jours)
  async getRecentJobs(limit = 10) {
    try {
      console.log(`DB: Getting recent jobs, limit: ${limit}`);
      const query = `
        SELECT * FROM jobs 
        WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
        ORDER BY created_at DESC
        LIMIT $1
      `;
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('DB Error getting recent jobs:', error.message);
      throw error;
    }
  }
};

// Fonctions pour les candidatures
const jobApplications = {
  // Créer une candidature
  async createApplication(userId, jobId, coverLetter = null) {
    try {
      console.log(`DB: Creating application - User: ${userId}, Job: ${jobId}`);
      
      // Vérifier si l'utilisateur a déjà postulé
      const checkQuery = 'SELECT * FROM job_applications WHERE user_id = $1 AND job_id = $2';
      const checkResult = await pool.query(checkQuery, [userId, jobId]);
      
      if (checkResult.rows.length > 0) {
        throw new Error('You have already applied to this job');
      }
      
      // Vérifier si le job existe
      const jobCheck = await pool.query('SELECT id FROM jobs WHERE id = $1', [jobId]);
      if (jobCheck.rows.length === 0) {
        throw new Error('Job not found');
      }
      
      // Vérifier si le job est expiré
      const jobExpiredCheck = await jobQueries.isJobExpired(jobId);
      if (jobExpiredCheck) {
        throw new Error('This job posting has expired and is no longer accepting applications');
      }
      
      // Créer la candidature
      const query = `
        INSERT INTO job_applications 
        (user_id, job_id, status, cover_letter) 
        VALUES ($1, $2, 'pending', $3) 
        RETURNING *
      `;
      const result = await pool.query(query, [userId, jobId, coverLetter]);
      console.log(`DB: Application created with ID: ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error) {
      console.error('DB Error creating application:', error.message);
      throw error;
    }
  },

  // Récupérer toutes les candidatures d'un utilisateur
  async getApplicationsByUser(userId) {
    try {
      console.log(`DB: Getting applications for user: ${userId}`);
      const query = `
        SELECT 
          ja.*,
          j.name,
          j.position,
          j.company_name,
          j.location,
          j.contract_type,
          j.level,
          j.time_type,
          j.work_mode,
          j.field,
          j.salary_range,
          j.description as job_description,
          j.requirements,
          j.benefits,
          j.created_at as job_created_at,
          ja.application_date,
          ja.updated_at as last_update
        FROM job_applications ja
        JOIN jobs j ON ja.job_id = j.id
        WHERE ja.user_id = $1
        ORDER BY ja.application_date DESC
      `;
      const result = await pool.query(query, [userId]);
      console.log(`DB: Found ${result.rows.length} applications for user ${userId}`);
      return result.rows;
    } catch (error) {
      console.error('DB Error getting applications:', error.message);
      throw error;
    }
  },

  // Récupérer une candidature spécifique
  async getApplicationById(applicationId) {
    try {
      console.log(`DB: Getting application by ID: ${applicationId}`);
      const query = `
        SELECT 
          ja.*,
          j.name,
          j.position,
          j.company_name,
          j.location,
          j.contract_type,
          j.level,
          j.time_type,
          j.work_mode,
          j.field,
          j.salary_range,
          j.description as job_description,
          j.requirements,
          j.benefits,
          j.created_at as job_created_at
        FROM job_applications ja
        JOIN jobs j ON ja.job_id = j.id
        WHERE ja.id = $1
      `;
      const result = await pool.query(query, [applicationId]);
      return result.rows[0];
    } catch (error) {
      console.error('DB Error getting application:', error.message);
      throw error;
    }
  },

  // Récupérer les candidatures pour un job (pour les recruteurs)
  async getApplicationsForJob(jobId, userId) {
    try {
      console.log(`DB: Getting applications for job: ${jobId} by user: ${userId}`);
      
      // Vérifier que l'utilisateur est propriétaire du job
      const jobCheck = await pool.query(
        'SELECT id, company_name FROM jobs WHERE id = $1',
        [jobId]
      );
      
      if (jobCheck.rows.length === 0) {
        throw new Error('Job not found');
      }
      
      const query = `
        SELECT 
          ja.*,
          u.email,
          u.account_type,
          cp.first_name,
          cp.last_name,
          cp.profile_picture,
          cp.skills
        FROM job_applications ja
        JOIN users u ON ja.user_id = u.id
        LEFT JOIN candidate_profiles cp ON u.id = cp.user_id
        WHERE ja.job_id = $1
        ORDER BY ja.application_date DESC
      `;
      
      const result = await pool.query(query, [jobId]);
      return result.rows;
    } catch (error) {
      console.error('DB Error getting applications for job:', error.message);
      throw error;
    }
  },

  // Mettre à jour le statut d'une candidature
  async updateApplicationStatus(applicationId, status, userId = null) {
    try {
      console.log(`DB: Updating application ${applicationId} to status: ${status}, userId check: ${userId}`);
      
      let query = `
        UPDATE job_applications 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `;
      
      const params = [status, applicationId];
      
      // Si un userId est fourni, vérifier qu'il est propriétaire de la candidature
      if (userId) {
        query += ' AND user_id = $3';
        params.push(userId);
      }
      
      query += ' RETURNING *';
      
      const result = await pool.query(query, params);
      
      if (result.rows.length === 0) {
        if (userId) {
          throw new Error('Application not found or access denied');
        } else {
          throw new Error('Application not found');
        }
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('DB Error updating application:', error.message);
      throw error;
    }
  },

  // Supprimer une candidature
  async deleteApplication(applicationId, userId = null) {
    try {
      console.log(`DB: Deleting application: ${applicationId}`);
      
      let query = 'DELETE FROM job_applications WHERE id = $1';
      const params = [applicationId];
      
      // Si un userId est fourni, vérifier qu'il est propriétaire de la candidature
      if (userId) {
        query += ' AND user_id = $2';
        params.push(userId);
      }
      
      query += ' RETURNING *';
      
      const result = await pool.query(query, params);
      
      if (result.rows.length === 0) {
        throw new Error('Application not found or access denied');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('DB Error deleting application:', error.message);
      throw error;
    }
  },

  // Compter les candidatures par statut pour un utilisateur
  async getApplicationStats(userId) {
    try {
      console.log(`DB: Getting application stats for user: ${userId}`);
      const query = `
        SELECT 
          status,
          COUNT(*) as count
        FROM job_applications 
        WHERE user_id = $1 
        GROUP BY status
      `;
      const result = await pool.query(query, [userId]);
      
      // Initialiser tous les statuts
      const stats = {
        pending: 0,
        reviewed: 0,
        accepted: 0,
        rejected: 0,
        total: 0
      };
      
      result.rows.forEach(row => {
        stats[row.status] = parseInt(row.count);
        stats.total += parseInt(row.count);
      });
      
      console.log(`DB: Stats for user ${userId}:`, stats);
      return stats;
    } catch (error) {
      console.error('DB Error getting application stats:', error.message);
      throw error;
    }
  },

  // Vérifier si un utilisateur a déjà postulé à un job
  async hasUserApplied(userId, jobId) {
    try {
      console.log(`DB: Checking if user ${userId} has applied to job ${jobId}`);
      const query = `
        SELECT id FROM job_applications 
        WHERE user_id = $1 AND job_id = $2
      `;
      const result = await pool.query(query, [userId, jobId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('DB Error checking if user has applied:', error.message);
      throw error;
    }
  }
};

// Fonctions pour les profiles
const profileQueries = {
  // Sauvegarder un profil candidat
  async saveCandidateProfile(userId, profileData) {
    try {
      console.log(`DB: Saving candidate profile for user: ${userId}`);
      
      // Vérifier si le profil existe déjà
      const checkQuery = 'SELECT user_id FROM candidate_profiles WHERE user_id = $1';
      const checkResult = await pool.query(checkQuery, [userId]);
      
      let query;
      let params;
      
      if (checkResult.rows.length > 0) {
        // Mettre à jour le profil existant
        query = `
          UPDATE candidate_profiles SET
            first_name = $1,
            last_name = $2,
            bio = $3,
            phone = $4,
            linkedin = $5,
            github = $6,
            profile_picture = $7,
            skills = $8,
            experiences = $9,
            educations = $10,
            activities = $11,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $12
          RETURNING *
        `;
        params = [
          profileData.first_name || '',
          profileData.last_name || '',
          profileData.bio || '',
          profileData.phone || '',
          profileData.linkedin || '',
          profileData.github || '',
          profileData.profile_picture || '',
          profileData.skills || [],
          profileData.experiences || [],
          profileData.educations || [],
          profileData.activities || [],
          userId
        ];
      } else {
        // Créer un nouveau profil
        query = `
          INSERT INTO candidate_profiles 
          (user_id, first_name, last_name, bio, phone, linkedin, github, 
           profile_picture, skills, experiences, educations, activities)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *
        `;
        params = [
          userId,
          profileData.first_name || '',
          profileData.last_name || '',
          profileData.bio || '',
          profileData.phone || '',
          profileData.linkedin || '',
          profileData.github || '',
          profileData.profile_picture || '',
          profileData.skills || [],
          profileData.experiences || [],
          profileData.educations || [],
          profileData.activities || []
        ];
      }
      
      const result = await pool.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error('DB Error saving candidate profile:', error.message);
      throw error;
    }
  },

  // Récupérer un profil candidat
  async getCandidateProfile(userId) {
    try {
      console.log(`DB: Getting candidate profile for user: ${userId}`);
      const query = 'SELECT * FROM candidate_profiles WHERE user_id = $1';
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      console.error('DB Error getting candidate profile:', error.message);
      throw error;
    }
  },

  // Sauvegarder un profil recruteur
  async saveRecruiterProfile(userId, profileData) {
    try {
      console.log(`DB: Saving recruiter profile for user: ${userId}`);
      
      // Vérifier si le profil existe déjà
      const checkQuery = 'SELECT user_id FROM recruiter_profiles WHERE user_id = $1';
      const checkResult = await pool.query(checkQuery, [userId]);
      
      let query;
      let params;
      
      if (checkResult.rows.length > 0) {
        // Mettre à jour le profil existant
        query = `
          UPDATE recruiter_profiles SET
            first_name = $1,
            last_name = $2,
            position = $3,
            bio = $4,
            phone = $5,
            linkedin = $6,
            work_email = $7,
            profile_picture = $8,
            company_name = $9,
            company_website = $10,
            industry = $11,
            company_size = $12,
            annual_revenue = $13,
            company_description = $14,
            company_location = $15,
            founded_year = $16,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $17
          RETURNING *
        `;
        params = [
          profileData.first_name || '',
          profileData.last_name || '',
          profileData.position || '',
          profileData.bio || '',
          profileData.phone || '',
          profileData.linkedin || '',
          profileData.work_email || '',
          profileData.profile_picture || '',
          profileData.company_name || '',
          profileData.company_website || '',
          profileData.industry || '',
          profileData.company_size || '',
          profileData.annual_revenue || '',
          profileData.company_description || '',
          profileData.company_location || '',
          profileData.founded_year || '',
          userId
        ];
      } else {
        // Créer un nouveau profil
        query = `
          INSERT INTO recruiter_profiles 
          (user_id, first_name, last_name, position, bio, phone, linkedin, work_email,
           profile_picture, company_name, company_website, industry, company_size,
           annual_revenue, company_description, company_location, founded_year)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          RETURNING *
        `;
        params = [
          userId,
          profileData.first_name || '',
          profileData.last_name || '',
          profileData.position || '',
          profileData.bio || '',
          profileData.phone || '',
          profileData.linkedin || '',
          profileData.work_email || '',
          profileData.profile_picture || '',
          profileData.company_name || '',
          profileData.company_website || '',
          profileData.industry || '',
          profileData.company_size || '',
          profileData.annual_revenue || '',
          profileData.company_description || '',
          profileData.company_location || '',
          profileData.founded_year || ''
        ];
      }
      
      const result = await pool.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error('DB Error saving recruiter profile:', error.message);
      throw error;
    }
  },

  // Récupérer un profil recruteur
  async getRecruiterProfile(userId) {
    try {
      console.log(`DB: Getting recruiter profile for user: ${userId}`);
      const query = 'SELECT * FROM recruiter_profiles WHERE user_id = $1';
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      console.error('DB Error getting recruiter profile:', error.message);
      throw error;
    }
  }
};

// Fonction query basique pour compatibilité
const query = async (text, params) => {
  try {
    console.log('DB Query:', text.substring(0, 100), params ? '...' : '');
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`DB Query executed in ${duration}ms`);
    return result;
  } catch (error) {
    console.error('DB Query error:', error.message);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  }
};

// Fonction pour exécuter une transaction
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  query,
  transaction,
  ...jobQueries,
  ...jobApplications,
  ...profileQueries
};