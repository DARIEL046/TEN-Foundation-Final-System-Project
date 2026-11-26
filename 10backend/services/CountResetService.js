import {
  getLastResetShipmentId,
  getLatestShipmentId,
  insertReset,
} from "../models/CountResetModel.js";

// ADDED - 2.2.2: starts a new batch. Returns { error } or { message }
export async function createReset(reasonText) {
  const reason = String(reasonText ?? "")
    .trim()
    .slice(0, 100);

  const latestId = await getLatestShipmentId();
  const lastResetId = await getLastResetShipmentId();

  // Nothing new was shipped since the last reset, so a reset is not needed
  if (latestId <= lastResetId) {
    return { error: "No new shipments since the last reset." };
  }

  await insertReset(latestId, reason || null);
  return { message: "New batch started. Count is back to 0." };
}
