import { useState, useEffect } from "react";
import { BAG_URL, INVENTORY_LOGIN_URL } from "../api/bagApi";
import InventoryMain from "../Components/InventoryMain";
import InventoryShipment from "../Components/InventoryShipment"; // ADDED - 2.1.2 Record Bag Shipments
import ShipmentHistory from "../Components/ShipmentHistory"; // ADDED - 2.2.1 View Shipment History
import "../StyleInventory.css";

function InventoryPage() {
  const [admin, setAdmin] = useState(() =>
    JSON.parse(sessionStorage.getItem("inventoryAdmin") || "null"),
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bags, setBags] = useState([]);

  // ADDED - 2.2.1: which tab is open: "inventory" (bags + shipments) or "history"
  const [tab, setTab] = useState("inventory");

  async function loadBags() {
    try {
      const response = await fetch(BAG_URL);
      const data = await response.json();
      setBags(Array.isArray(data) ? data : []);
    } catch {
      // fixed
      setBags([]);
    }
  }
  // ADDED - 2.1.2: changes only when the top section adds/edits/deletes a bag.
  const [shipmentVersion, setShipmentVersion] = useState(0);

  useEffect(() => {
    // replace in 2.1.2
    if (!admin) return;

    let cancelled = false;

    // ADDED - 2.1.2: loads the bags once after login (same as loadBags, but lint-safe)
    async function firstLoad() {
      try {
        const response = await fetch(BAG_URL);
        const data = await response.json();
        if (!cancelled) setBags(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setBags([]);
      }
    }

    firstLoad();

    return () => {
      cancelled = true;
    };
  }, [admin]);

  // Used by the top section (add / edit / delete a bag)
  // ADDED - 2.1.2: also bumps shipmentVersion so the shipment form reloads its dropdown
  async function handleBagsChanged() {
    await loadBags();
    setShipmentVersion((version) => version + 1);
  }

  async function handleLogin(event) {
    event.preventDefault();

    const response = await fetch(INVENTORY_LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    sessionStorage.setItem("inventoryAdmin", JSON.stringify(data));
    setAdmin(data);
  }

  function handleLogout() {
    sessionStorage.removeItem("inventoryAdmin");
    setAdmin(null);
    setBags([]);
    setEmail("");
    setPassword("");
    setTab("inventory"); // ADDED - 2.2.1: next login starts on the first tab
  }

  // Not logged in -> inventory login form
  if (!admin) {
    return (
      <section className="inventory">
        <h1>Inventory</h1>

        <div className="card">
          <h2>Inventory Admin Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="buttonTab">
              Login
            </button>
          </form>
        </div>
      </section>
    );
  }

  // Logged in -> your 2.1.1 code
  return (
    <section className="inventory">
      <h1>Bag Inventory</h1>
      <div className="menu">
        <div className="menu">
          {/* ADDED - 2.2.1: tab buttons. The open tab is the colored one */}
          <span>
            <button
              className={
                tab === "inventory" ? "buttonTab" : "buttonTab buttonGray"
              }
              onClick={() => setTab("inventory")}
            >
              {" "}
              Inventory{" "}
            </button>
            <button
              className={
                tab === "history" ? "buttonTab" : "buttonTab buttonGray"
              }
              onClick={() => setTab("history")}
            >
              {" "}
              Shipment History
            </button>
          </span>
        </div>
        <button className="buttonTab buttonGray" onClick={handleLogout}>
          {" "}
          Logout{" "}
        </button>
      </div>
      {/* First tab: 2.1.1 bag records + 2.1.2 shipment form */}
      {tab === "inventory" && (
        <>
          <InventoryMain bags={bags} loadBags={handleBagsChanged} />
          {/* ADDED - 2.1.2 Record Bag Shipments */}
          <InventoryShipment key={shipmentVersion} onShipped={loadBags} />
        </>
      )}

      {/* ADDED - 2.2.1: second tab = shipment history */}
      {tab === "history" && <ShipmentHistory bags={bags} />}
    </section>
  );
}

export default InventoryPage;
