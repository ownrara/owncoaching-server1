import express from "express";
import { login, signup } from "../controllers/auth.controller.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/signup
router.post("/signup", signup);

export default router;
