const { Pool } = require('pg');

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'wehirenow_user',
  password: process.env.DB_PASSWORD || 'mdp',
  database: process.env.DB_NAME || 'wehirenow_db',
  port: Number(process.env.DB_PORT) || 5432,                  // PostgreSQL default port
  max: 10,                                                    // Maximum number of clients in the pool
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

module.exports = pool;

// For MySQL version, uncomment below and comment the PostgreSQL code above:
/*
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'wehirenow_user',
  password: process.env.DB_PASSWORD || 'SQLEFREI' || 'mdp',
  database: process.env.DB_NAME || 'wehirenow_db',
  port: Number(process.env.DB_PORT) || 3306, // MySQL default port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test MySQL connection
(async () => {
  try {
    const conn = await pool.getConnection();
    const [r] = await conn.query('SELECT DATABASE() db, USER() usr, NOW() ts');
    console.log('Connected to MySQL:', r[0]);
    conn.release();
  } catch (e) {
    console.error('MySQL connection error:', e.message);
  }
})();

module.exports = pool;
*/