const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'wehirenow_user',
  password: process.env.PGPASSWORD || 'your_password',
  database: process.env.PGDATABASE || 'wehirenow_db',
  port: process.env.PGPORT || 5432,
});

pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('PostgreSQL connection error:', err.message));

module.exports = pool;
