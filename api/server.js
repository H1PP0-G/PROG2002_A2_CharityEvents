const path = require("path");
const express = require("express");
const cors = require("cors");
const { pool, checkConnection } = require("./event_db");
require("dotenv").config();

const app = express();
const port = Number(process.env.PORT || 3030);
const clientDirectory = path.join(__dirname, "..", "client");
app.use(cors());
app.use(express.json());
app.use(express.static(clientDirectory));

const fallbackOrganisation = {
  id: 1,
  name: "Harbour Hearts Foundation",
  mission:
    "We turn local generosity into practical support for families, wildlife and community health.",
  email: "hello@harbourhearts.org.au",
  phone: "+61 2 5550 1840",
  website: "https://harbourhearts.org.au",
};
const fallbackCategories = [
  { id: 1, name: "Fun Run" },
  { id: 2, name: "Gala Dinner" },
  { id: 3, name: "Live Music" },
  { id: 4, name: "Silent Auction" },
  { id: 5, name: "Community Workshop" },
];
const fallbackEvents = [
  [
    "Harbour Sunrise Run",
    "Fund emergency food parcels for local families.",
    "Start the weekend with a welcoming 5 km community run along the foreshore. Every registration helps stock emergency food parcels for families facing unexpected hardship.",
    "2026-10-10",
    "07:00:00",
    "10:30:00",
    "Darling Harbour Foreshore",
    "1 Convention Place",
    "Sydney",
    25,
    30000,
    18750,
    "run",
    1,
  ],
  [
    "A Night for New Beginnings",
    "Fund transitional accommodation for women and children.",
    "An elegant evening of local food, live stories and a three-course dinner supporting safe transitional accommodation.",
    "2026-10-24",
    "18:30:00",
    "22:30:00",
    "The Glasshouse",
    "17 Market Street",
    "Sydney",
    120,
    70000,
    51200,
    "gala",
    2,
  ],
  [
    "Songs for the Sea",
    "Protect coastal wildlife and restore beaches.",
    "Local artists come together for a joyful acoustic concert with a direct focus on marine rescue and shoreline restoration.",
    "2026-11-07",
    "18:00:00",
    "21:30:00",
    "The Enmore Theatre",
    "118-132 Enmore Road",
    "Sydney",
    45,
    45000,
    29350,
    "music",
    3,
  ],
  [
    "Bid for Bright Futures",
    "Provide laptops and tutoring for young people.",
    "Discover donated art, dining and travel experiences in a relaxed auction supporting digital access.",
    "2026-11-21",
    "14:00:00",
    "18:00:00",
    "The Foundry Hall",
    "8 Union Lane",
    "Melbourne",
    10,
    25000,
    9400,
    "auction",
    4,
  ],
  [
    "Neighbourhood Repair Lab",
    "Reduce waste and teach practical repair skills.",
    "Bring a small household item and learn from volunteer fixers while supporting circular economy education.",
    "2026-12-05",
    "10:00:00",
    "13:00:00",
    "Westside Community Hub",
    "44 Park Road",
    "Brisbane",
    0,
    12000,
    7100,
    "workshop",
    5,
  ],
  [
    "Twilight Steps Challenge",
    "Support mobility equipment grants.",
    "A friendly twilight walk with accessible routes, music and a finish-line picnic for all ages and abilities.",
    "2027-01-16",
    "16:30:00",
    "20:00:00",
    "Riverside Park",
    "2 River Avenue",
    "Adelaide",
    18,
    22000,
    6600,
    "walk",
    1,
  ],
  [
    "Table of Thanks",
    "Fund meals for older people living alone.",
    "Share a long-table meal with neighbours and hear how community kitchens create connection and dignity.",
    "2027-02-06",
    "18:00:00",
    "22:00:00",
    "Laneway Kitchen",
    "9 Victoria Street",
    "Perth",
    95,
    38000,
    20100,
    "dinner",
    2,
  ],
  [
    "Open Mic for Mental Health",
    "Expand free peer-support groups.",
    "An inclusive open mic night celebrating local voices and raising funds for free community mental health groups.",
    "2027-03-13",
    "17:30:00",
    "21:00:00",
    "Northside Arts Centre",
    "12 Station Road",
    "Hobart",
    20,
    18000,
    11800,
    "mic",
    3,
  ],
].map((item, index) => ({
  id: index + 1,
  name: item[0],
  purpose: item[1],
  description: item[2],
  date: item[3],
  startTime: item[4],
  endTime: item[5],
  venue: item[6],
  address: item[7],
  city: item[8],
  ticketPrice: item[9],
  goalAmount: item[10],
  raisedAmount: item[11],
  imageKey: item[12],
  category: { id: item[13], name: fallbackCategories[item[13] - 1].name },
  organisation: fallbackOrganisation,
  progressPercent:
    item[10] > 0 ? Math.min(100, Math.round((item[11] / item[10]) * 100)) : 0,
}));

function normaliseEvent(row) {
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
function fallbackSearch(query) {
  return fallbackEvents.filter(
    (event) =>
      (!query.date || event.date === query.date) &&
      (!query.location ||
        `${event.city} ${event.venue}`
          .toLowerCase()
          .includes(query.location.toLowerCase())) &&
      (!query.category || event.category.id === Number(query.category)),
  );
}

app.get("/api/health", async (req, res) => {
  try {
    await checkConnection();
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.json({ status: "degraded", database: "offline", demoData: true });
  }
});
app.get("/api/categories", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT category_id AS id, name, description FROM categories ORDER BY name",
    );
    res.json(rows);
  } catch {
    res.json(fallbackCategories);
  }
});
app.get("/api/organisations", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT organisation_id AS id, name, mission, email, phone, website FROM organisations ORDER BY name",
    );
    res.json(rows);
  } catch {
    res.json([fallbackOrganisation]);
  }
});
app.get("/api/events", async (req, res, next) => {
  const { date, location, category } = req.query;
  if (!validDate(date))
    return res.status(400).json({ error: "Date must use YYYY-MM-DD format." });
  try {
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
  } catch (error) {
    if (
      error.code === "ER_ACCESS_DENIED_ERROR" ||
      error.code === "ECONNREFUSED" ||
      error.code === "PROTOCOL_CONNECTION_LOST"
    ) {
      const events = fallbackSearch(req.query);
      return res.json({ count: events.length, events, demoData: true });
    }
    next(error);
  }
});
app.get("/api/events/:id", async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1)
    return res
      .status(400)
      .json({ error: "Event id must be a positive integer." });
  try {
    const [rows] = await pool.query(
      'SELECT e.*, c.name AS category_name, o.name AS organisation_name FROM events e JOIN categories c ON c.category_id=e.category_id JOIN organisations o ON o.organisation_id=e.organisation_id WHERE e.event_id=? AND e.status="active"',
      [id],
    );
    if (!rows.length)
      return res.status(404).json({ error: "Event not found." });
    res.json(normaliseEvent(rows[0]));
  } catch (error) {
    const event = fallbackEvents.find((item) => item.id === id);
    if (event) return res.json(event);
    next(error);
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
