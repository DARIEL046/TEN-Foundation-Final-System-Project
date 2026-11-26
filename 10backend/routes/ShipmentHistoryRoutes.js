import express from "express"; // 2.2.1 Shipment History Will show in the data base
import pool from "../config/db.js";

const router = express.Router();

// Get all previous shipments (newest first) with the bag's name, code, color and destination
router.get("/shipment-history", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id,
              b.product_name AS productName,
              b.product_code AS productCode,
              b.color AS color,
              s.quantity AS quantity,
              s.destination AS destination,
              s.shipped_at AS shippedAt
       FROM shipments s
       LEFT JOIN bags b ON b.id = s.bag_id
       ORDER BY s.shipped_at DESC, s.id DESC`,
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
