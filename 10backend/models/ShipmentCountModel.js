import pool from "../config/db.js";

// ADDED - 2.2.2: adds up ALL shipments ever made (nothing is deleted or changed)
export async function getTotalShipped() {
  const [rows] = await pool.query(
    "SELECT COALESCE(SUM(quantity), 0) AS totalShipped FROM shipments",
  );
  return Number(rows[0].totalShipped);
}

// ADDED - 2.2.2: adds up the shipments made AFTER the last reset
export async function getShippedAfter(shipmentId) {
  const [rows] = await pool.query(
    "SELECT COALESCE(SUM(quantity), 0) AS total FROM shipments WHERE id > ?",
    [shipmentId],
  );
  return Number(rows[0].total);
}
