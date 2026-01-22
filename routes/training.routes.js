import express from "express";
import {
  getTrainingPlan,
  saveTrainingPlan,
} from "../controllers/training.controller.js";

const router = express.Router();

// /api/training/:clientId
router.get("/:clientId", getTrainingPlan);
router.put("/:clientId", saveTrainingPlan);

export default router;
