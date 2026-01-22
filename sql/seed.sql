-- Users (for later auth steps)
INSERT INTO users (email, password, role)
VALUES
  ('coach@owncoaching.com', '1234', 'coach'),
  ('client1@owncoaching.com', '1234', 'client'),
  ('client2@owncoaching.com', '1234', 'client')
ON CONFLICT (email) DO NOTHING;

-- Clients
INSERT INTO clients (id, name)
VALUES
  ('c1', 'Client One'),
  ('c2', 'Client Two')
ON CONFLICT (id) DO NOTHING;

-- Training plans (minimal starter JSON)
INSERT INTO training_plans (client_id, plan_json)
VALUES
  ('c1', '{"planName":"Starter Plan","durationWeeks":4,"currentWeek":1,"weeks":[]}' ),
  ('c2', '{"planName":"Starter Plan","durationWeeks":4,"currentWeek":1,"weeks":[]}' )
ON CONFLICT (client_id) DO NOTHING;

-- Nutrition plans (minimal starter JSON)
INSERT INTO nutrition_plans (client_id, nutrition_json)
VALUES
  ('c1', '{"plans":[],"currentPlanId":""}' ),
  ('c2', '{"plans":[],"currentPlanId":""}' )
ON CONFLICT (client_id) DO NOTHING;

-- Check-ins (empty at start; you can insert one later if you want)
