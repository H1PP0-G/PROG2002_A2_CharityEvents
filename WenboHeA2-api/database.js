const mysql = require("mysql2/promise");
const dbDetails = require("./db-details");

function getConnection() {
  // This single connection follows the Module 3 teaching example and is
  // useful for one-off database operations or connection demonstrations.
  return mysql.createConnection(dbDetails);
}

function getPool() {
  // The API uses a pool so several browser requests can share managed
  // connections instead of opening a new connection for every request.
  return mysql.createPool({
    ...dbDetails,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,
  });
}

module.exports = { getConnection, getPool };
