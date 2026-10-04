require("dotenv").config();

// Keep credentials outside the source code so the same API can run in each
// student's local environment without exposing a password in GitHub.
module.exports = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "charityevents_db",
};
