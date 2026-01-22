import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { pool } from "./db/db.js";

import clientsRoutes from "./routes/clients.routes.js";
import trainingRoutes from "./routes/training.routes.js";
import nutritionRoutes from "./routes/nutrition.routes.js";
import checkinsRoutes from "./routes/checkins.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

/* ======================
   MIDDLEWARE
====================== */
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const PORT = process.env.PORT || 5000;

/* ======================
   HEALTH CHECK
====================== */
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "owncoaching-backend" });
});

/* ======================
   DB CHECK
====================== */

app.get("/api/db-check", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS now;");
    res.json({ ok: true, now: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* ======================
   ROUTES
====================== */

app.use("/api/clients", clientsRoutes);
app.use("/api/training", trainingRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/checkins", checkinsRoutes);
app.use("/api/auth", authRoutes);

/* ======================
   START SERVER
====================== */
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
