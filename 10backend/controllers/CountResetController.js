import { createReset } from "../services/CountResetService.js";

// ADDED - 2.2.2: handles POST /shipment-count/reset
export async function startNewBatch(req, res) {
  try {
    const result = await createReset(req.body.reason);

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }
    res.status(201).json({ message: result.message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
