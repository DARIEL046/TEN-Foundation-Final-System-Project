import {
  getTotalShipped,
  getShippedAfter,
} from "../models/ShipmentCountModel.js";
import {
  getLastResetShipmentId,
  getManualResetCount,
} from "../models/CountResetModel.js";
import { calculateCount } from "../services/ShipmentCountService.js";

// ADDED - 2.2.2: handles GET /shipment-count
export async function getShipmentCount(req, res) {
  try {
    const lastResetId = await getLastResetShipmentId();
    const totalShipped = await getTotalShipped();
    const batchTotal = await getShippedAfter(lastResetId);
    const manualResets = await getManualResetCount();

    res.json(calculateCount(totalShipped, batchTotal, manualResets));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
