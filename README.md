# Charity Events

PROG2002 Assessment 2 implementation for a dynamic charity events website.

## Run

1. Create the MySQL database by running `api/schema.sql` in MySQL Workbench.
2. Copy `api/.env.example` to `api/.env` and set your MySQL credentials.
3. From `api/`, run `npm install` then `npm start`.
4. Open `http://localhost:3030`.

The API serves the static client and exposes:

- `GET /api/events` (optional `date`, `location`, `category` filters)
- `GET /api/events/:id`
- `GET /api/categories`
- `GET /api/organisations`

The implementation uses Node.js, Express, MySQL, HTML, CSS, JavaScript, DOM events and `fetch`, as required by the brief. The registration button intentionally displays the required construction message for Assessment 2.

## GenAI declaration

The assessment brief requires a declaration if GenAI was used. Complete the declaration in your submitted project report according to your actual use and your unit assessor's instructions.
