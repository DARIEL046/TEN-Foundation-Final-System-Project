import { useEffect, useState } from "react"; //2.2.1 Shipment History
import "../ShipmentHistoryStyle.css";

const API = "http://localhost:3000/api";

// Asks the backend for the shipment history.
// It only fetches and returns the data. It does not touch React state.
async function getHistory() {
  const response = await fetch(API + "/shipment-history");

  // Stop with a clear error if the backend did not answer OK
  if (!response.ok) {
    throw new Error("history status " + response.status);
  }

  const rows = await response.json();

  // If the backend sent something that is not a list, use an empty list
  return Array.isArray(rows) ? rows : [];
}

// Shows the previous shipments in a table.
// "bags" is only used to reload the table after a shipment is made.
function ShipmentHistory({ bags }) {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  // Runs when the page opens and again whenever the bag list changes
  useEffect(() => {
    let cancelled = false;

    // Loads the history and saves it in state
    async function loadHistory() {
      try {
        const rows = await getHistory();
        if (cancelled) return; // page was closed before the data arrived
        setHistory(rows);
        setError("");
      } catch (err) {
        if (cancelled) return;
        console.error("History load failed:", err); // shows in F12 Console
        setError("Can't load shipment history (" + err.message + ")");
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [bags]);

  return (
    <div className="card shipmentHistory">
      <h2>Shipment History</h2>

      {error && <p className="historyError">{error}</p>}

      {history.length === 0 ? (
        <p>No shipments yet.</p>
      ) : (
        <div className="historyScroll">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Code</th>
                <th>Color</th>
                <th>Quantity</th>
                <th>Ship to</th> {/* NEW */}
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>{item.productName || "(deleted bag)"}</td>
                  <td>{item.productCode || "-"}</td>
                  <td>{item.color || "-"}</td>
                  <td>{item.quantity}</td>
                  <td>{item.destination || "-"}</td> {/* NEW */}
                  <td>{new Date(item.shippedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ShipmentHistory;
