// MySQL avec mysql2 en mode Promise
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
});
module.exports = pool;

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