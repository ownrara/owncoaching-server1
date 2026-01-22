import { pool } from "../db/db.js";

/**
 * GET /api/nutrition/:clientId
 * Returns nutrition state JSON for one client.
 * Shape:
 * { plans: [...], currentPlanId: "..." }
 */
export async function getNutritionPlan(req, res) {
  try {
    const { clientId } = req.params;

    const result = await pool.query(
      "SELECT nutrition_json FROM nutrition_plans WHERE client_id = $1;",
      [clientId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ ok: false, error: "Nutrition plan not found" });
    }

    const nutrition = JSON.parse(result.rows[0].nutrition_json);
    res.json(nutrition);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

/**
 * PUT /api/nutrition/:clientId
 * Body = full nutrition state object
 */
export async function saveNutritionPlan(req, res) {
  try {
    const { clientId } = req.params;
    const nutrition = req.body;

    if (!nutrition || typeof nutrition !== "object") {
      return res.status(400).json({ ok: false, error: "Invalid body" });
    }

    // Optional minimal validation 
    if (!Array.isArray(nutrition.plans)) {
      return res
        .status(400)
        .json({ ok: false, error: "nutrition.plans must be an array" });
    }

    if (typeof nutrition.currentPlanId !== "string") {
      return res
        .status(400)
        .json({ ok: false, error: "nutrition.currentPlanId must be a string" });
    }

    const nutritionJson = JSON.stringify(nutrition);

    await pool.query(
      `
      INSERT INTO nutrition_plans (client_id, nutrition_json)
      VALUES ($1, $2)
      ON CONFLICT (client_id)
      DO UPDATE SET nutrition_json = EXCLUDED.nutrition_json;
      `,
      [clientId, nutritionJson]
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
