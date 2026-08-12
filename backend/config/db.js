require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'royal_event',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

// Prevent an unexpected connection-level error (e.g. MySQL not reachable)
// from crashing the whole Node process — log it and let individual
// queries fail gracefully instead via their own try/catch blocks.
pool.on('error', (err) => {
  console.error('MySQL pool error:', err.message);
});

module.exports = pool;
