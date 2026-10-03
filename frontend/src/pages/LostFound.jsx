import { useEffect, useState } from "react";
import { AlertCircle, Calendar, CheckCircle2, MapPin, Phone, Plus, Search, Tag } from "lucide-react";
import { api } from "../api";

export default function LostFound() {
  const [items, setItems] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    title: "",
    category: "Electronics",
    location_found: "Campus Library 2nd Floor",
    status: "found",
    contact_info: "Security Office / Student Desk",
    photo_url: "",
  });

  async function load() {
    try {
      const data = await api("/api/lost-found");
      setItems(data);
    } catch (err) {
      setError(err.message || "Failed to load lost & found items");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleReport(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMsg("");
    try {
      await api("/api/admin/lost_found_items", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          date_reported: new Date().toISOString().split("T")[0],
        }),
      });
      setMsg("Report posted successfully!");
      setShowModal(false);
      setForm({
        title: "",
        category: "Electronics",
        location_found: "Campus Ground / Canteen",
        status: "found",
        contact_info: "",
        photo_url: "",
      });
      load();
    } catch (err) {
      setError(err.message || "Failed to post item report.");
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = filterStatus === "all" ? items : items.filter((i) => i.status === filterStatus);

  return (
    <div className="fade-in">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <h1>Sahyadri Campus Lost & Found</h1>
          <p style={{ margin: 0 }}>Report lost items or claim misplaced belongings found on college grounds.</p>
        </div>
        <button className="btn primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Report Item
        </button>
      </div>

      {msg && <div className="badge ok" style={{ width: "100%", padding: "0.6rem", marginBottom: "1rem" }}>{msg}</div>}
      {error && <div className="error" style={{ marginBottom: "1rem" }}>{error}</div>}

      {/* Filter Tabs */}
      <div className="tabs" style={{ marginBottom: "1.25rem" }}>
        {["all", "found", "lost", "claimed"].map((status) => (
          <button
            key={status}
            className={`tab ${filterStatus === status ? "active" : ""}`}
            onClick={() => setFilterStatus(status)}
          >
            {status.toUpperCase()} ({status === "all" ? items.length : items.filter((i) => i.status === status).length})
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-3">
        {filtered.map((item) => (
          <div key={item.id} className="card">
            <div className="row" style={{ justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span className={`badge ${item.status === "found" ? "ok" : item.status === "lost" ? "risk" : "neutral"}`}>
                {item.status.toUpperCase()}
              </span>
              <span className="badge neutral">
                <Tag size={12} /> {item.category}
              </span>
            </div>

            <h2>{item.title}</h2>

            <div className="list-item">
              <span className="muted" style={{ fontSize: "0.78rem" }}>Location</span>
              <p style={{ margin: "0.1rem 0", fontSize: "0.85rem", fontWeight: 600 }}>
                <MapPin size={13} style={{ verticalAlign: "middle", marginRight: "0.2rem" }} />
                {item.location_found}
              </p>
            </div>

            <div className="list-item">
              <span className="muted" style={{ fontSize: "0.78rem" }}>Reported On</span>
              <p style={{ margin: "0.1rem 0", fontSize: "0.85rem" }}>
                <Calendar size={13} style={{ verticalAlign: "middle", marginRight: "0.2rem" }} />
                {new Date(item.date_reported).toLocaleDateString()}
              </p>
            </div>

            {item.contact_info && (
              <div className="list-item">
                <span className="muted" style={{ fontSize: "0.78rem" }}>Contact / Claim Desk</span>
                <p style={{ margin: "0.1rem 0", fontSize: "0.85rem", color: "var(--forest)", fontWeight: 600 }}>
                  <Phone size={13} style={{ verticalAlign: "middle", marginRight: "0.2rem" }} />
                  {item.contact_info}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal to report item */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-card fade-in" onClick={(e) => e.stopPropagation()}>
            <h2>Report Lost or Found Campus Item</h2>
            <p className="muted" style={{ fontSize: "0.85rem" }}>
              Provide details so the owner or campus security desk can track it.
            </p>

            <form className="form" onSubmit={handleReport} style={{ marginTop: "1rem" }}>
              <div className="field">
                <label>Item Name / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blue HP Laptop Charger / Black Titan Watch"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="grid-2">
                <div className="field">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="found">FOUND (I picked it up)</option>
                    <option value="lost">LOST (I misplaced it)</option>
                    <option value="claimed">CLAIMED</option>
                  </select>
                </div>

                <div className="field">
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="Electronics">Electronics & Gadgets</option>
                    <option value="ID & Cards">College ID & Bank Cards</option>
                    <option value="Keys & Bags">Keys, Backpacks & Helmets</option>
                    <option value="Stationery & Books">Stationery & Lab Records</option>
                    <option value="Other">Other Miscellaneous</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Location Where Found / Misplaced</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical Block Lab 3 / Food Court / Central Library"
                  value={form.location_found}
                  onChange={(e) => setForm({ ...form, location_found: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Contact Info or Claim Instructions</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Left with Chief Security Guard / Call +91 9876543210"
                  value={form.contact_info}
                  onChange={(e) => setForm({ ...form, contact_info: e.target.value })}
                />
              </div>

              <div className="row" style={{ justifyContent: "flex-end", marginTop: "0.5rem" }}>
                <button type="button" className="btn ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn primary" disabled={submitting}>
                  {submitting ? "Posting…" : "Submit Item Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
