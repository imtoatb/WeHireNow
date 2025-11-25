// MySQL avec mysql2 en mode Promise
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'wehirenow_user',
  password: process.env.DB_PASSWORD || 'SQLEFREI',
  database: process.env.DB_NAME || 'wehirenow_db',
  port: Number(process.env.DB_PORT) || 3306, // MySQL/MariaDB par défaut
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
//
//(async () => {
  //try {
    //const conn = await pool.getConnection();
    //const [r] = await conn.query('SELECT DATABASE() db, USER() usr, NOW() ts');
    //console.log('✅ MySQL ping OK:', r[0]);
    //conn.release();
  //} catch (e) {
    //console.error('❌ MySQL connection error:', e.message);
  //}
//})();

module.exports = pool;
