CREATE DATABASE IF NOT EXISTS charityevents_db;
USE charityevents_db;

-- Re-running this file gives the marker a clean, repeatable database setup.
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS organisations;

CREATE TABLE organisations (
  organisation_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  mission TEXT NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  website VARCHAR(255)
);

CREATE TABLE categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL UNIQUE,
  description VARCHAR(255)
);

CREATE TABLE events (
  event_id INT PRIMARY KEY AUTO_INCREMENT,
  organisation_id INT NOT NULL,
  category_id INT NOT NULL,
  name VARCHAR(160) NOT NULL,
  purpose VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue VARCHAR(160) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(80) NOT NULL,
  ticket_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  goal_amount DECIMAL(12,2) NOT NULL,
  raised_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  image_key VARCHAR(40) NOT NULL DEFAULT 'community',
  status ENUM('active','suspended') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_org FOREIGN KEY (organisation_id) REFERENCES organisations(organisation_id),
  CONSTRAINT fk_events_category FOREIGN KEY (category_id) REFERENCES categories(category_id),
  CONSTRAINT chk_event_amounts CHECK (goal_amount >= 0 AND raised_amount >= 0 AND raised_amount <= goal_amount),
  INDEX idx_events_date (event_date),
  INDEX idx_events_city (city),
  INDEX idx_events_status (status)
);

-- Seed data is intentionally varied so Home, Search and Details can be
-- demonstrated with several categories, cities, prices and goal amounts.
INSERT INTO organisations (name, mission, email, phone, website) VALUES
('Harbour Hearts Foundation', 'We turn local generosity into practical support for families, wildlife and community health.', 'hello@harbourhearts.org.au', '+61 2 5550 1840', 'https://harbourhearts.org.au');

INSERT INTO categories (name, description) VALUES
('Fun Run', 'Active community fundraising events.'),
('Gala Dinner', 'Evenings of food, stories and giving.'),
('Live Music', 'Concerts that turn every ticket into impact.'),
('Silent Auction', 'Bid on memorable experiences and goods.'),
('Community Workshop', 'Hands-on events that build stronger neighbourhoods.');

INSERT INTO events (organisation_id, category_id, name, purpose, description, event_date, start_time, end_time, venue, address, city, ticket_price, goal_amount, raised_amount, image_key) VALUES
(1, 1, 'Harbour Sunrise Run', 'Fund emergency food parcels for local families.', 'Start the weekend with a welcoming 5 km community run along the foreshore. Every registration helps stock emergency food parcels for families facing unexpected hardship.', '2026-10-10', '07:00:00', '10:30:00', 'Darling Harbour Foreshore', '1 Convention Place', 'Sydney', 25.00, 30000.00, 18750.00, 'run'),
(1, 2, 'A Night for New Beginnings', 'Fund transitional accommodation for women and children.', 'An elegant evening of local food, live stories and a three-course dinner supporting safe transitional accommodation.', '2026-10-24', '18:30:00', '22:30:00', 'The Glasshouse', '17 Market Street', 'Sydney', 120.00, 70000.00, 51200.00, 'gala'),
(1, 3, 'Songs for the Sea', 'Protect coastal wildlife and restore beaches.', 'Local artists come together for a joyful acoustic concert with a direct focus on marine rescue and shoreline restoration.', '2026-11-07', '18:00:00', '21:30:00', 'The Enmore Theatre', '118-132 Enmore Road', 'Sydney', 45.00, 45000.00, 29350.00, 'music'),
(1, 4, 'Bid for Bright Futures', 'Provide laptops and tutoring for young people.', 'Discover donated art, dining and travel experiences in a relaxed online and in-person auction supporting digital access.', '2026-11-21', '14:00:00', '18:00:00', 'The Foundry Hall', '8 Union Lane', 'Melbourne', 10.00, 25000.00, 9400.00, 'auction'),
(1, 5, 'Neighbourhood Repair Lab', 'Reduce waste and teach practical repair skills.', 'Bring a small household item and learn from volunteer fixers while supporting circular economy education.', '2026-09-12', '10:00:00', '13:00:00', 'Westside Community Hub', '44 Park Road', 'Brisbane', 0.00, 12000.00, 7100.00, 'workshop'),
(1, 1, 'Twilight Steps Challenge', 'Support mobility equipment grants.', 'A friendly twilight walk with accessible routes, music and a finish-line picnic for all ages and abilities.', '2027-01-16', '16:30:00', '20:00:00', 'Riverside Park', '2 River Avenue', 'Adelaide', 18.00, 22000.00, 6600.00, 'walk'),
(1, 2, 'Table of Thanks', 'Fund meals for older people living alone.', 'Share a long-table meal with neighbours and hear how community kitchens create connection and dignity.', '2027-02-06', '18:00:00', '22:00:00', 'Laneway Kitchen', '9 Victoria Street', 'Perth', 95.00, 38000.00, 20100.00, 'dinner'),
(1, 3, 'Open Mic for Mental Health', 'Expand free peer-support groups.', 'An inclusive open mic night celebrating local voices and raising funds for free community mental health groups.', '2027-03-13', '17:30:00', '21:00:00', 'Northside Arts Centre', '12 Station Road', 'Hobart', 20.00, 18000.00, 11800.00, 'mic');
