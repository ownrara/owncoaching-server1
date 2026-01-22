import express from "express";
import {
  getNutritionPlan,
  saveNutritionPlan,
} from "../controllers/nutrition.controller.js";

const router = express.Router();

// /api/nutrition/:clientId
router.get("/:clientId", getNutritionPlan);
router.put("/:clientId", saveNutritionPlan);

export default router;
