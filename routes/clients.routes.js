import express from "express";
import { pool } from "../db/db.js";

const router = express.Router();

/**
 * GET /api/clients
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, full_name, email, phone, age, height_cm, current_weight_kg, goal, training_experience, injuries, preferences FROM clients ORDER BY name ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load clients" });
  }
});

/**
 * GET /api/clients/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT id, name, full_name, email, phone, age, height_cm, current_weight_kg, goal, training_experience, injuries, preferences FROM clients WHERE id=$1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Map to frontend-friendly keys
    const r = result.rows[0];
    res.json({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      email: r.email,
      phone: r.phone,
      age: r.age,
      heightCm: r.height_cm,
      currentWeightKg: r.current_weight_kg,
      goal: r.goal,
      trainingExperience: r.training_experience,
      injuries: r.injuries,
      preferences: r.preferences,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load client" });
  }
});

/**
 * PUT /api/clients/:id
 * Update profile fields
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      fullName,
      email,
      phone,
      age,
      heightCm,
      currentWeightKg,
      goal,
      trainingExperience,
      injuries,
      preferences,
    } = req.body || {};

    // Update first
    const updateResult = await pool.query(
      `UPDATE clients
       SET
         name = COALESCE($2, name),
         full_name = COALESCE($3, full_name),
         email = COALESCE($4, email),
         phone = COALESCE($5, phone),
         age = COALESCE($6, age),
         height_cm = COALESCE($7, height_cm),
         current_weight_kg = COALESCE($8, current_weight_kg),
         goal = COALESCE($9, goal),
         training_experience = COALESCE($10, training_experience),
         injuries = COALESCE($11, injuries),
         preferences = COALESCE($12, preferences)
       WHERE id = $1
       RETURNING id, name, full_name, email, phone, age, height_cm, current_weight_kg, goal, training_experience, injuries, preferences`,
      [
        id,
        name ?? null,
        fullName ?? null,
        email ?? null,
        phone ?? null,
        age ?? null,
        heightCm ?? null,
        currentWeightKg ?? null,
        goal ?? null,
        trainingExperience ?? null,
        injuries ?? null,
        preferences ?? null,
      ]
    );

    // If client doesn't exist, insert a row (optional but useful for your course demo)
    if (updateResult.rows.length === 0) {
      const insertResult = await pool.query(
        `INSERT INTO clients
          (id, name, full_name, email, phone, age, height_cm, current_weight_kg, goal, training_experience, injuries, preferences)
         VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING id, name, full_name, email, phone, age, height_cm, current_weight_kg, goal, training_experience, injuries, preferences`,
        [
          id,
          name ?? `Client ${id}`,
          fullName ?? null,
          email ?? null,
          phone ?? null,
          age ?? null,
          heightCm ?? null,
          currentWeightKg ?? null,
          goal ?? null,
          trainingExperience ?? null,
          injuries ?? null,
          preferences ?? null,
        ]
      );

      const r = insertResult.rows[0];
      return res.json({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        email: r.email,
        phone: r.phone,
        age: r.age,
        heightCm: r.height_cm,
        currentWeightKg: r.current_weight_kg,
        goal: r.goal,
        trainingExperience: r.training_experience,
        injuries: r.injuries,
        preferences: r.preferences,
      });
    }

    const r = updateResult.rows[0];
    res.json({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      email: r.email,
      phone: r.phone,
      age: r.age,
      heightCm: r.height_cm,
      currentWeightKg: r.current_weight_kg,
      goal: r.goal,
      trainingExperience: r.training_experience,
      injuries: r.injuries,
      preferences: r.preferences,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save client profile" });
  }
});

export default router;
