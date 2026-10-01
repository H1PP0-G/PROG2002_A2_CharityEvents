# Assessment implementation notes

This file is a technical checklist for explaining the work in the student's own project report and video. It is not a replacement for the required individual report.

## Requirements covered

- Database: `api/schema.sql` creates `charityevents_db`, related organisation/category/event tables, foreign keys, checks, indexes and eight sample events.
- Connection: `api/event_db.js` creates a pooled MySQL connection using environment variables.
- REST API: `api/server.js` provides category, organisation, event list/filter and event detail endpoints using parameterised queries and appropriate error statuses.
- Home: `client/index.html` loads organisation mission/contact data and the active event list from APIs.
- Search: `client/search.html` supports date, location and category filtering, reset, empty results and error states.
- Details: `client/event.html?id=...` loads one event, shows purpose, description, venue, time, ticket price and goal progress. The registration button displays the required construction message.
- Client-side scripting: external JavaScript, DOM APIs, event listeners, promises/async-await, URL query strings and safe text escaping are used.
- Responsive design: shared CSS supports desktop, tablet and mobile layouts.

## Demo sequence

1. Show `api/schema.sql` and explain the organisation -> category -> event relationships.
2. Start the API with `npm install` and `npm start`; show `/api/health` and `/api/events`.
3. Open the home page and explain that the organisation and event cards are loaded with `fetch`.
4. Open Find an event, filter by a city and category, then clear the filters.
5. Open an event card and explain how the URL `id` selects the API detail request.
6. Click Register interest and show the required construction message.

## Environment

Copy `.env.example` to `.env`, set valid local MySQL credentials, run `schema.sql`, then start the server from `api/`.
