const mysql = require("mysql2/promise");
const dbDetails = require("./db-details");

function getConnection() {
  return mysql.createConnection(dbDetails);
}

function getPool() {
  return mysql.createPool({
    ...dbDetails,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,
  });
}

module.exports = { getConnection, getPool };
