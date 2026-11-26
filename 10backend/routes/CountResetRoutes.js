import express from "express";
import { startNewBatch } from "../controllers/CountResetController.js";

const router = express.Router();

// ADDED - 2.2.2: POST /api/shipment-count/reset
router.post("/shipment-count/reset", startNewBatch);

export default router;
