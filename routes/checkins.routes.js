import express from "express";
import {
  createCheckIn,
  getCheckIns,
  getCheckInById,
  reviewCheckIn,
} from "../controllers/checkins.controller.js";

const router = express.Router();

// /api/checkins
router.get("/", getCheckIns);
router.post("/", createCheckIn);

// /api/checkins/:id
router.get("/:id", getCheckInById);

// /api/checkins/:id/review
router.put("/:id/review", reviewCheckIn);

export default router;
