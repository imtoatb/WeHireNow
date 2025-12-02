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

  // Rechercher des jobs avec filtres
  async searchJobs(filters) {
    try {
      console.log('DB: Searching jobs with filters:', filters);
      
      let sql = "SELECT * FROM jobs WHERE 1=1";
      const params = [];
      let index = 1;

      if (filters.contractTypes && filters.contractTypes.length > 0) {
        const placeholders = filters.contractTypes.map(() => `$${index++}`).join(",");
        sql += ` AND contract_type IN (${placeholders})`;
        params.push(...filters.contractTypes);
      }

      if (filters.levels && filters.levels.length > 0) {
        const placeholders = filters.levels.map(() => `$${index++}`).join(",");
        sql += ` AND level IN (${placeholders})`;
        params.push(...filters.levels);
      }

      if (filters.timeTypes && filters.timeTypes.length > 0) {
        const placeholders = filters.timeTypes.map(() => `$${index++}`).join(",");
        sql += ` AND time_type IN (${placeholders})`;
        params.push(...filters.timeTypes);
      }

      if (filters.workModes && filters.workModes.length > 0) {
        const placeholders = filters.workModes.map(() => `$${index++}`).join(",");
        sql += ` AND work_mode IN (${placeholders})`;
        params.push(...filters.workModes);
      }

      if (filters.fields && filters.fields.length > 0) {
        const placeholders = filters.fields.map(() => `$${index++}`).join(",");
        sql += ` AND field IN (${placeholders})`;
        params.push(...filters.fields);
      }

      if (filters.area) {
        sql += ` AND location ILIKE $${index++}`;
        params.push(`%${filters.area}%`);
      }

      if (filters.keywords) {
        sql += ` AND (position ILIKE $${index} OR name ILIKE $${index} OR description ILIKE $${index + 1})`;
        params.push(`%${filters.keywords}%`, `%${filters.keywords}%`);
        index += 2;
      }

      sql += " ORDER BY created_at DESC";

      const result = await pool.query(sql, params);
      console.log(`DB: Found ${result.rows.length} jobs`);
      return result.rows;
    } catch (error) {
      console.error('DB Error searching jobs:', error.message);
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
          j.benefits
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

  // Mettre à jour le statut d'une candidature
  async updateApplicationStatus(applicationId, status) {
    try {
      console.log(`DB: Updating application ${applicationId} to status: ${status}`);
      const query = `
        UPDATE job_applications 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 
        RETURNING *
      `;
      const result = await pool.query(query, [status, applicationId]);
      return result.rows[0];
    } catch (error) {
      console.error('DB Error updating application:', error.message);
      throw error;
    }
  },

  // Supprimer une candidature
  async deleteApplication(applicationId) {
    try {
      console.log(`DB: Deleting application: ${applicationId}`);
      const query = 'DELETE FROM job_applications WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [applicationId]);
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
  }
};

// Fonction query basique pour compatibilité
const query = async (text, params) => {
  try {
    console.log('DB Query:', text.substring(0, 100), '...');
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('DB Query error:', error.message);
    throw error;
  }
};

module.exports = {
  query,
  ...jobQueries,
  ...jobApplications
};