import express from "express";
import { getAllClients, getClientById } from "../controllers/clients.controller.js";

const router = express.Router();

// /api/clients
router.get("/", getAllClients);

// /api/clients/:clientId
router.get("/:clientId", getClientById);

export default router;
