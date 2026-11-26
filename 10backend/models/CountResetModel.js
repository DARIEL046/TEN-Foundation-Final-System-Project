import pool from "../config/db.js";

// ADDED - 2.2.2: id of the shipment where the last reset happened (0 if no reset yet)
export async function getLastResetShipmentId() {
  const [rows] = await pool.query(
    "SELECT COALESCE(MAX(after_shipment_id), 0) AS lastId FROM count_resets",
  );
  return Number(rows[0].lastId);
}

// ADDED - 2.2.2: how many times the admin pressed Start New Batch
export async function getManualResetCount() {
  const [rows] = await pool.query("SELECT COUNT(*) AS total FROM count_resets");
  return Number(rows[0].total);
}

// ADDED - 2.2.2: id of the newest shipment (0 if there are no shipments)
export async function getLatestShipmentId() {
  const [rows] = await pool.query(
    "SELECT COALESCE(MAX(id), 0) AS latestId FROM shipments",
  );
  return Number(rows[0].latestId);
}

// ADDED - 2.2.2: saves a reset marker (no shipment is changed or deleted)
export async function insertReset(afterShipmentId, reason) {
  await pool.query(
    "INSERT INTO count_resets (after_shipment_id, reason) VALUES (?, ?)",
    [afterShipmentId, reason],
  );
}
