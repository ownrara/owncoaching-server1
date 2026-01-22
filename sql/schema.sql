-- =========================
-- CORE TABLES
-- =========================

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,

  full_name TEXT,
  email TEXT,
  phone TEXT,
  age INT,
  height_cm INT,
  current_weight_kg NUMERIC,
  goal TEXT,
  training_experience TEXT,
  injuries TEXT,
  preferences TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,

  -- client users link to clients.id, coach has NULL
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS training_plans (
  client_id TEXT PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  plan_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS nutrition_plans (
  client_id TEXT PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  nutrition_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS check_ins (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  coach_notes TEXT NOT NULL,
  payload_json TEXT NOT NULL
);

-- =========================
-- SYSTEM DEFAULT COACH
-- =========================
-- This coach is part of system initialization (NOT seed data)

INSERT INTO users (email, password, role)
VALUES ('coach@test.com', '1234', 'coach')
ON CONFLICT (email) DO NOTHING;
