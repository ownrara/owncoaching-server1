import { pool } from "../db/db.js";

/**
 * GET /api/training/:clientId
 * Returns training plan JSON for one client.
 */
export async function getTrainingPlan(req, res) {
  try {
    const { clientId } = req.params;

    const result = await pool.query(
      "SELECT plan_json FROM training_plans WHERE client_id = $1;",
      [clientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: "Training plan not found" });
    }

    // plan_json is stored as TEXT, so parse before returning
    const plan = JSON.parse(result.rows[0].plan_json);
    res.json(plan);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

/**
 * PUT /api/training/:clientId
 * Body = full training plan object (same shape as frontend)
 */
export async function saveTrainingPlan(req, res) {
  try {
    const { clientId } = req.params;
    const plan = req.body;

    if (!plan || typeof plan !== "object") {
      return res.status(400).json({ ok: false, error: "Invalid plan body" });
    }

    const planJson = JSON.stringify(plan);

    // Upsert (insert if missing, update if exists)
    await pool.query(
      `
      INSERT INTO training_plans (client_id, plan_json)
      VALUES ($1, $2)
      ON CONFLICT (client_id)
      DO UPDATE SET plan_json = EXCLUDED.plan_json;
      `,
      [clientId, planJson]
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
