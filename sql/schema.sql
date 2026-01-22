CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

-- Store the entire training plan as JSON string (TEXT)
-- Keeps it simple and matches Part-05’s “basic types” style.
CREATE TABLE IF NOT EXISTS training_plans (
  client_id TEXT PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  plan_json TEXT NOT NULL
);

-- Store the entire nutrition state as JSON string (TEXT)
CREATE TABLE IF NOT EXISTS nutrition_plans (
  client_id TEXT PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  nutrition_json TEXT NOT NULL
);

-- Check-ins: keep a few searchable columns + store full payload as JSON string
CREATE TABLE IF NOT EXISTS check_ins (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  coach_notes TEXT NOT NULL,
  payload_json TEXT NOT NULL
);
