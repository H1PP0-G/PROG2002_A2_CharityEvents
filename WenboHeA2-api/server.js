const path = require("path");
const express = require("express");
const cors = require("cors");
const { pool, checkConnection } = require("./event_db");
require("dotenv").config();

const app = express();
const port = Number(process.env.PORT || 3030);
const clientDirectory = path.join(__dirname, "..", "WenboHeA2-clientside");

// Express serves both the REST resources and the static client so the browser
// uses one origin for pages, images and API requests.
app.use(cors());
app.use(express.json());
app.use(express.static(clientDirectory));

function normaliseEvent(row) {
  // Convert SQL column names and numeric strings into the JSON shape expected
  // by the client. Progress is calculated once at the API boundary.
  return {
    id: row.event_id,
    name: row.name,
    purpose: row.purpose,
    description: row.description,
    date: row.event_date,
    startTime: row.start_time,
    endTime: row.end_time,
    venue: row.venue,
    address: row.address,
    city: row.city,
    ticketPrice: Number(row.ticket_price),
    goalAmount: Number(row.goal_amount),
    raisedAmount: Number(row.raised_amount),
    progressPercent:
      row.goal_amount > 0
        ? Math.min(100, Math.round((row.raised_amount / row.goal_amount) * 100))
        : 0,
    imageKey: row.image_key,
    category: { id: row.category_id, name: row.category_name },
    organisation: { id: row.organisation_id, name: row.organisation_name },
  };
}
function validDate(value) {
  return !value || /^\d{4}-\d{2}-\d{2}$/.test(value);
}
app.get("/api/health", async (req, res) => {
  try {
    await checkConnection();
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.json({ status: "degraded", database: "offline"});
  }
});
app.get("/api/categories", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT category_id AS id, name, description FROM categories ORDER BY name",
    );
    res.json(rows);
  } catch {
    res.status(503).json({
      error: "Database unavailable.",
    });
  }
});
app.get("/api/organisations", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT organisation_id AS id, name, mission, email, phone, website FROM organisations ORDER BY name",
    );
    res.json(rows);
  } catch {
    res.status(503).json({
      error: "Database unavailable.",
    });
  }
});
app.get("/api/events", async (req, res, next) => {
  const { date, location, category } = req.query;
  if (!validDate(date))
    return res.status(400).json({ error: "Date must use YYYY-MM-DD format." });
  try {
    // Build optional filters and pass their values separately. Parameterised
    // queries prevent user-entered search text becoming SQL code.
    const conditions = ["e.status = 'active'"];
    const params = [];
    if (date) {
      conditions.push("e.event_date = ?");
      params.push(date);
    }
    if (location) {
      conditions.push("(e.city LIKE ? OR e.venue LIKE ?)");
      params.push(`%${location}%`, `%${location}%`);
    }
    if (category) {
      conditions.push("c.category_id = ?");
      params.push(Number(category));
    }
    const [rows] = await pool.query(
      `SELECT e.*, c.name AS category_name, o.name AS organisation_name FROM events e JOIN categories c ON c.category_id=e.category_id JOIN organisations o ON o.organisation_id=e.organisation_id WHERE ${conditions.join(" AND ")} ORDER BY e.event_date, e.start_time`,
      params,
    );
    res.json({ count: rows.length, events: rows.map(normaliseEvent) });
  } catch {
    return res.status(503).json({
      error: "Database unavailable.",
    });
  }
});
app.get("/api/events/:id", async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1)
    return res
      .status(400)
      .json({ error: "Event id must be a positive integer." });
  try {
    // The :id path parameter identifies one resource, following the REST
    // pattern demonstrated in Module 4.
    const [rows] = await pool.query(
      'SELECT e.*, c.name AS category_name, o.name AS organisation_name FROM events e JOIN categories c ON c.category_id=e.category_id JOIN organisations o ON o.organisation_id=e.organisation_id WHERE e.event_id=? AND e.status="active"',
      [id],
    );
    if (!rows.length)
      return res.status(404).json({ error: "Event not found." });
    res.json(normaliseEvent(rows[0]));
  } catch {
    return res.status(503).json({
      error: "Database unavailable.",
    });
  }
});
app.get("*", (req, res) =>
  res.sendFile(path.join(clientDirectory, "index.html")),
);
app.use((error, req, res, next) => {
  console.error(error);
  res
    .status(500)
    .json({ error: "The server could not complete that request." });
});
app.listen(port, () =>
  console.log(`Charity Events server running at http://localhost:${port}`),
);
