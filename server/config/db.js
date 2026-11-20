/**
 * MySQL Database Connection Pool
 * Uses mysql2/promise for clean async/await syntax.
 * Connection pooling manages multiple concurrent queries efficiently without opening
 * and closing connections for every request.
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'fixify_db',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

// Add SSL support if DB_SSL or MYSQL_SSL is set to true (common for cloud DBs like Aiven, TiDB, Render)
if (process.env.DB_SSL === 'true' || process.env.MYSQL_SSL === 'true') {
  dbConfig.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = mysql.createPool(dbConfig);

// Startup connection verification (non-blocking, graceful warning on failure)
pool
  .getConnection()
  .then((conn) => {
    console.log(`🔌 [Database] Connected successfully to MySQL [${dbConfig.database}] on ${dbConfig.host}:${dbConfig.port}`);
    conn.release();
  })
  .catch((err) => {
    console.warn(`⚠️ [Database Warning] Could not connect to MySQL at ${dbConfig.host}:${dbConfig.port}: ${err.message}`);
    console.warn(`💡 [Database Tip] Verify DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME in environment variables.`);
    console.warn(`   Server will remain online so health checks and documentation endpoints work.`);
  });

/**
 * Health-check helper function
 * Safely tests whether the MySQL connection pool is responsive.
 */
async function checkDbHealth() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    return {
      connected: true,
      database: dbConfig.database,
      host: dbConfig.host,
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message,
      database: dbConfig.database,
      host: dbConfig.host,
    };
  }
}

module.exports = pool;
module.exports.checkDbHealth = checkDbHealth;
