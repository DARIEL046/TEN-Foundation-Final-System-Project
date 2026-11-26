import express from "express";
import { getShipmentCount } from "../controllers/ShipmentCountController.js";

const router = express.Router();

// ADDED - 2.2.2: GET /api/shipment-count
router.get("/shipment-count", getShipmentCount);

export default router;
