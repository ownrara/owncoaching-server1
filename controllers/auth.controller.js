import { pool } from "../db/db.js";

function defaultTrainingPlan(clientId) {
  return {
    planName: "Starter Plan",
    durationWeeks: 1,
    currentWeek: 1,
    weeks: [
      {
        weekNumber: 1,
        focus: "Base volume + technique",
        days: [
          {
            day: "Day 1 - Custom",
            exercises: [
              { name: "Squat", sets: 3, reps: "8-10", notes: "" },
              { name: "Bench Press", sets: 3, reps: "8-10", notes: "" },
            ],
          },
        ],
      },
    ],
  };
}

function defaultNutritionPlan(clientId) {
  return {
    plans: [
      {
        id: "np1",
        name: "Cut Plan",
        description: "High protein cut",
        durationWeeks: 4,
        dailyGoals: { calories: 2100, protein: 160, carbs: 200, fat: 60 },
        coachNotes: "Hit protein daily. Steps: 8-10k.",
        days: [
          {
            day: "Day 1",
            meals: [
              {
                name: "Meal 1",
                items: [
                  {
                    name: "Oats",
                    calories: 300,
                    protein: 10,
                    carbs: 50,
                    fat: 6,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    currentPlanId: "np1",
  };
}

/**
 * POST /api/auth/login
 * body: { email, password }
 * returns: { ok:true, user:{ id, email, role, clientId? } }
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ ok: false, error: "Email and password required" });
    }

    // Select client_id too
    const result = await pool.query(
      "SELECT id, email, password, role, client_id FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ ok: false, error: "Invalid credentials" });
    }

    if (String(user.password) !== String(password)) {
      return res.status(401).json({ ok: false, error: "Invalid credentials" });
    }

    let clientId = null;

    if (String(user.role).toLowerCase() === "client") {
      //  Use the DB link (users.client_id) — do NOT rebuild it from user.id
      clientId = user.client_id ? String(user.client_id) : null;

      // Safety fallback: if old data exists without client_id
      if (!clientId) {
        clientId = `c_${user.id}`;

        // Ensure client row exists
        await pool.query(
          `INSERT INTO clients (id, name, email)
           VALUES ($1, $2, $3)
           ON CONFLICT (id) DO NOTHING`,
          [clientId, `Client ${clientId}`, user.email]
        );

        // Link user -> client (fix old rows)
        await pool.query(
          `UPDATE users SET client_id = $1 WHERE id = $2`,
          [clientId, user.id]
        );
      }

      // Ensure default plans exist
      const trainingJson = JSON.stringify(defaultTrainingPlan(clientId));
      const nutritionJson = JSON.stringify(defaultNutritionPlan(clientId));

      await pool.query(
        `INSERT INTO training_plans (client_id, plan_json)
         VALUES ($1, $2)
         ON CONFLICT (client_id) DO NOTHING`,
        [clientId, trainingJson]
      );

      await pool.query(
        `INSERT INTO nutrition_plans (client_id, nutrition_json)
         VALUES ($1, $2)
         ON CONFLICT (client_id) DO NOTHING`,
        [clientId, nutritionJson]
      );
    }

    return res.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        clientId,
      },
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

/**
 * POST /api/auth/signup
 * body: { email, password }
 * - No role field on signup.
 * - Always creates a CLIENT account.
 * - Auto creates client row + default training & nutrition.
 */
export async function signup(req, res) {
  const client = await pool.connect();
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ ok: false, error: "Email and password required" });
    }

    await client.query("BEGIN");

    // 1) Create user as client
    const createUser = await client.query(
      `INSERT INTO users (email, password, role)
       VALUES ($1, $2, 'client')
       RETURNING id, email, role`,
      [email, password]
    );

    const user = createUser.rows[0];

    // 2) Create client profile id
    const clientId = `c_${user.id}`;

    await client.query(
      `INSERT INTO clients (id, name, email)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING`,
      [clientId, `Client ${clientId}`, email]
    );

    // 3) Link user -> client using users.client_id
    await client.query(
      `UPDATE users SET client_id = $1 WHERE id = $2`,
      [clientId, user.id]
    );

    // 4) Default training & nutrition rows
    const trainingJson = JSON.stringify(defaultTrainingPlan(clientId));
    const nutritionJson = JSON.stringify(defaultNutritionPlan(clientId));

    await client.query(
      `INSERT INTO training_plans (client_id, plan_json)
       VALUES ($1, $2)
       ON CONFLICT (client_id) DO NOTHING`,
      [clientId, trainingJson]
    );

    await client.query(
      `INSERT INTO nutrition_plans (client_id, nutrition_json)
       VALUES ($1, $2)
       ON CONFLICT (client_id) DO NOTHING`,
      [clientId, nutritionJson]
    );

    await client.query("COMMIT");

    return res.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        clientId,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");

    if (String(err.message || "").toLowerCase().includes("duplicate")) {
      return res.status(409).json({ ok: false, error: "Email already exists" });
    }

    return res.status(500).json({ ok: false, error: err.message });
  } finally {
    client.release();
  }
}
