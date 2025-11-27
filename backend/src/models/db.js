const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'wehirenow_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'wehirenow_db',
  password: process.env.DB_PASSWORD || 'mdp',
  port: process.env.DB_PORT || 5432,
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to PostgreSQL, server time:', res.rows[0].now);
  }
});

module.exports = pool;