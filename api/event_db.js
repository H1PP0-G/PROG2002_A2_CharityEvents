const { getPool } = require("./database");

const pool = getPool();

async function checkConnection() {
  // A ping gives the health endpoint a safe way to report database status
  // without running a data-changing query.
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

module.exports = { pool, checkConnection };
