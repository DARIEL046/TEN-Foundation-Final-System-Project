import "dotenv/config";
import express from "express";
import cors from "cors";
import workerRoutes from "./routes/workerRoutes.js";
import authRoutes, { getSecret } from "./routes/authRoutes.js";
import logbookRoutes from "./routes/logbookRoutes.js";
import traineeRoutes from "./routes/traineeRoutes.js"; // ADDED
import InventoryRoutes from "./routes/InventoryRoutes.js"; //Added 2.1.1
import ShipmentRoutes from "./routes/ShipmentRoutes.js"; // Added for 2.1.2 Shipment
import ShipmentHistoryRoutes from "./routes/ShipmentHistoryRoutes.js"; // 2.2.1 History Shipment
let corsOptions = {
  origin: "http://localhost:5173",
};

getSecret();

const app = express();

app.use(express.json());
app.use(cors(corsOptions));

app.use("/auth", authRoutes);
app.use("/worker", workerRoutes);
app.use("/logbook", logbookRoutes);
app.use("/trainee", traineeRoutes); // ADDED
app.use("/api", InventoryRoutes); // added 2.1.1
app.use("/api", ShipmentRoutes); // Added for 2.1.2 Shipment
app.use("/api", ShipmentHistoryRoutes); // Added for 2.2 Shipment history 2.2.1

try {
  const port = 3000;
  app.listen(port, () => {
    console.log(`listening to port ${port}...`);
  });
} catch (e) {
  console.log(e);
}
