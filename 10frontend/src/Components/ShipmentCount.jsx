import { useEffect, useState } from "react";
import "../ShipmentCountStyle.css";

const API = "http://localhost:3000/api";

// ADDED - 2.2.2: asks the backend for the shipment count.
// It only fetches and returns the data. It does not touch React state.
async function getCount() {
  const response = await fetch(API + "/shipment-count");

  // Stop with a clear error if the backend did not answer OK
  if (!response.ok) {
    throw new Error("count status " + response.status);
  }

  return await response.json();
}

// ADDED - 2.2.2: shows the count and the Start New Batch button.
// "bags" is only used to reload the count after a shipment is made.
function ShipmentCount({ bags }) {
  const [count, setCount] = useState(null);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState(null); // { type: "ok" | "bad", text }

  // Runs when the tab opens and again whenever the bag list changes
  useEffect(() => {
    let cancelled = false;

    // Loads the count and saves it in state
    async function loadCount() {
      try {
        const data = await getCount();
        if (cancelled) return; // tab was closed before the data arrived
        setCount(data);
      } catch (err) {
        if (cancelled) return;
        console.error("Count load failed:", err); // shows in F12 Console
        setMessage({
          type: "bad",
          text: "Can't load shipment count (" + err.message + ")",
        });
      }
    }

    loadCount();

    return () => {
      cancelled = true;
    };
  }, [bags]);

  // ADDED - 2.2.2: asks for confirmation, then sends the reset to the backend
  async function handleReset() {
    if (!window.confirm("Start a new batch? The count will go back to 0."))
      return;
    setMessage(null);

    try {
      const response = await fetch(API + "/shipment-count/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason }),
      });
      const result = await response.json();

      // The backend said no (for example: no new shipments)
      if (!response.ok) {
        setMessage({ type: "bad", text: result.message });
        return;
      }

      setMessage({ type: "ok", text: result.message });
      setReason("");
      setCount(await getCount()); // show the new count
    } catch (err) {
      console.error("Reset failed:", err);
      setMessage({
        type: "bad",
        text: "Can't reach the server. Is the backend running?",
      });
    }
  }

  return (
    <div className="card shipmentCount">
      <h2>Shipment Count</h2>

      {count && (
        <>
          <p className="countBig">
            {count.currentCount} / {count.resetAt}
          </p>

          {/* The bar fills up, then goes back to empty */}
          <div className="countBar">
            <div
              className="countFill"
              style={{
                width: (count.currentCount / count.resetAt) * 100 + "%",
              }}
            />
          </div>

          <p>
            Bags left until reset: <strong>{count.remainingToReset}</strong>
          </p>
          <p>
            Auto resets (this batch): <strong>{count.autoResets}</strong>
          </p>
          <p>
            Manual resets: <strong>{count.manualResets}</strong>
          </p>
          <p>
            Total bags shipped (all time): <strong>{count.totalShipped}</strong>
          </p>

          <div className="countReset">
            <input
              type="text"
              placeholder="Reason (optional), e.g. Big order 5,000 bags"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <button type="button" className="buttonTab" onClick={handleReset}>
              Start New Batch
            </button>
          </div>
        </>
      )}

      {message && (
        <p className={"countMessage " + message.type}>{message.text}</p>
      )}
    </div>
  );
}

export default ShipmentCount;
