import { useEffect, useState } from "react"; // New InventoryShipment 2.1.2 (Record Bagshipment)
import "../StyleInventory.css";
import "../ShipmentStyle.css";

const API = "http://localhost:3000/api";

// Asks the backend for the bags.
// It only fetches and returns the data. It does not touch React state.
async function getBags() {
  const response = await fetch(API + "/bags");

  // Stop with a clear error if the backend did not answer OK
  if (!response.ok) {
    throw new Error("bags status " + response.status);
  }

  const bags = await response.json();

  // If the backend sent an error instead of a list, use an empty list
  return Array.isArray(bags) ? bags : [];
}

function InventoryShipment({ onShipped }) {
  const [bags, setBags] = useState([]);
  const [bagId, setBagId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [destination, setDestination] = useState("");
  const [message, setMessage] = useState(null); // { type: "ok" | "bad", text }

  // Runs ONCE when the page opens
  useEffect(() => {
    let cancelled = false;

    async function firstLoad() {
      try {
        const data = await getBags();
        if (cancelled) return; // page was closed before the data arrived
        setBags(data);
      } catch (err) {
        if (cancelled) return;
        console.error("Bag load failed:", err); // shows in F12 Console
        setMessage({
          type: "bad",
          text: "Can't load bags (" + err.message + ")",
        });
      }
    }

    firstLoad();

    return () => {
      cancelled = true;
    };
  }, []);

  // The bag the admin picked (used to show its stock)
  const selectedBag = bags.find((bag) => String(bag.id) === bagId);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);

    // Check what the admin typed
    if (!bagId) {
      setMessage({ type: "bad", text: "Please choose a bag." });
      return;
    }
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
      setMessage({ type: "bad", text: "Enter a quantity of 1 or more." });
      return;
    }

    try {
      // Send the shipment to the backend
      const response = await fetch(API + "/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bagId: Number(bagId),
          quantity: Number(quantity),
          destination: destination,
        }),
      });
      const result = await response.json();

      // The backend said no)
      if (!response.ok) {
        setMessage({ type: "bad", text: result.message });
        return;
      }

      // Success: clear the form and show the updated stock
      setMessage({
        type: "ok",
        text: `${result.message} Stock left: ${result.remaining}.`,
      });
      setQuantity("");
      setDestination("");

      setBags(await getBags());

      if (onShipped) onShipped(); // refresh the bag list above
    } catch (err) {
      console.error("Shipment failed:", err); // shows in F12 Console
      setMessage({
        type: "bad",
        text: "Can't reach the server. Is the backend running?",
      });
    }
  }

  return (
    <div className="card shipment">
      <h2>Record Bag Shipment</h2>

      <form onSubmit={handleSubmit}>
        <select value={bagId} onChange={(e) => setBagId(e.target.value)}>
          <option value="">-- Choose a bag --</option>
          {bags.map((bag) => (
            <option key={bag.id} value={bag.id}>
              {bag.productName} ({bag.productCode}) - Stock: {bag.quantity}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Quantity to ship"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <input
          type="text"
          placeholder="Ship to (optional)"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />

        <button type="submit" className="buttonTab">
          Ship Bags
        </button>
      </form>

      {selectedBag && (
        <p>
          Current stock: <strong>{selectedBag.quantity}</strong>
        </p>
      )}

      {message && (
        <p className={"shipmentMessage " + message.type}>{message.text}</p>
      )}

      <h3>Stock After Shipping</h3>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Code</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {bags.map((bag) => (
            <tr key={bag.id}>
              <td>{bag.productName}</td>
              <td>{bag.productCode}</td>
              <td>{bag.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryShipment;
