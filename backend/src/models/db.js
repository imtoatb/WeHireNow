const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'wehirenow_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'wehirenow_db',
  password: process.env.DB_PASSWORD || 'mdp',
  port: process.env.DB_PORT || 5432,
});

// Test de connexion
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erreur connexion PostgreSQL:', err);
  } else {
    console.log('✅ Connecté à PostgreSQL, heure du serveur:', res.rows[0].now);
  }
});

module.exports = pool;