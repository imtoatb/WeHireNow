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

// Fonctions pour les candidatures
const jobApplications = {
  // Créer une candidature
  async createApplication(userId, jobId, coverLetter = null) {
    try {
      console.log(`DB: Creating application - User: ${userId}, Job: ${jobId}, CoverLetter: ${coverLetter ? 'Yes' : 'No'}`);
      
      // Vérifier si l'utilisateur a déjà postulé
      const checkQuery = 'SELECT * FROM job_applications WHERE user_id = $1 AND job_id = $2';
      const checkResult = await pool.query(checkQuery, [userId, jobId]);
      
      if (checkResult.rows.length > 0) {
        throw new Error('You have already applied to this job');
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
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('DB Query error:', error.message);
    throw error;
  }
};

module.exports = {
  query,
  ...jobApplications
};