const { getPool } = require("./database");

const pool = getPool();

async function checkConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

module.exports = { pool, checkConnection };
