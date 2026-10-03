import { useEffect, useState } from "react";
import { AlertOctagon, Check, Plus, RefreshCw, ShieldAlert, ShieldCheck, Trash2, Users } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../auth";

export default function Admin() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [resource, setResource] = useState("users");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const resources = [
    { id: "users", label: "Student Accounts" },
    { id: "subjects", label: "Curriculum Subjects" },
    { id: "announcements", label: "Campus Announcements" },
    { id: "placements", label: "Placement Drives" },
    { id: "lost_found_items", label: "Lost & Found Log" },
  ];

  async function loadStats() {
    try {
      const data = await api("/api/admin/stats");
      setStats(data);
    } catch (err) {
      setError(err.message || "Admin access required");
    }
  }

  async function loadResourceItems() {
    setLoading(true);
    try {
      const data = await api(`/api/admin/${resource}`);
      setItems(data);
    } catch (err) {
      setError(err.message || `Failed to fetch ${resource}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === "admin") {
      loadStats();
      loadResourceItems();
    }
  }, [user, resource]);

  async function deleteItem(id) {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    setMsg("");
    setError("");
    try {
      await api(`/api/admin/${resource}/${id}`, { method: "DELETE" });
      setMsg("Record deleted successfully!");
      loadResourceItems();
      loadStats();
    } catch (err) {
      setError(err.message || "Failed to delete record.");
    }
  }

  if (user?.role !== "admin") {
    return (
      <div className="fade-in card empty" style={{ marginTop: "2rem" }}>
        <ShieldAlert size={48} style={{ color: "var(--danger)", marginBottom: "0.5rem" }} />
        <h2>Admin Portal Access Restricted</h2>
        <p>You must be signed in with administrator credentials (admin@sahyadri.edu.in) to access this dashboard.</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <h1>Administrator Management Console</h1>
          <p style={{ margin: 0 }}>System-wide student portal stats, database records, and content moderation.</p>
        </div>
        <span className="badge ok">
          <ShieldCheck size={14} /> Admin Mode
        </span>
      </div>

      {msg && <div className="badge ok" style={{ width: "100%", padding: "0.6rem", marginBottom: "1rem" }}>{msg}</div>}
      {error && <div className="error" style={{ marginBottom: "1rem" }}>{error}</div>}

      {/* Admin Stats Grid */}
      {stats && (
        <div className="grid grid-4" style={{ marginBottom: "1.25rem" }}>
          <div className="card stat">
            <span className="label">Registered Students</span>
            <div className="value">{stats.total_students}</div>
          </div>
          <div className="card stat">
            <span className="label">Total Subjects</span>
            <div className="value">{stats.total_subjects}</div>
          </div>
          <div className="card stat">
            <span className="label">Active Announcements</span>
            <div className="value">{stats.total_announcements}</div>
          </div>
          <div className="card stat">
            <span className="label">Placement Drives</span>
            <div className="value">{stats.total_placements}</div>
          </div>
        </div>
      )}

      {/* Resource Table Switcher */}
      <div className="tabs" style={{ marginBottom: "1.25rem" }}>
        {resources.map((r) => (
          <button
            key={r.id}
            className={`tab ${resource === r.id ? "active" : ""}`}
            onClick={() => setResource(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Generic Resource Data Table */}
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: "0.8rem" }}>
          <h2>{resources.find((r) => r.id === resource)?.label} ({items.length})</h2>
          <button className="btn ghost small" onClick={loadResourceItems}>
            <RefreshCw size={13} /> Refresh List
          </button>
        </div>

        {items.length === 0 ? (
          <div className="empty">No records found for {resource}.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Primary Name / Title</th>
                  <th>Details / Meta</th>
                  <th>Created / Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>#{item.id}</strong>
                    </td>
                    <td>
                      <strong>{item.name || item.title || item.subject_name || item.company_name}</strong>
                      {item.usn && <div className="muted" style={{ fontSize: "0.75rem" }}>USN: {item.usn}</div>}
                      {item.code && <div className="muted" style={{ fontSize: "0.75rem" }}>Code: {item.code}</div>}
                    </td>
                    <td>
                      {item.email || item.department || item.role || item.location_found || item.category || "—"}
                    </td>
                    <td>
                      <span className="badge neutral">
                        {item.role || item.status || item.exam_type || "Active"}
                      </span>
                    </td>
                    <td>
                      <button className="btn ghost small" onClick={() => deleteItem(item.id)} title="Delete row">
                        <Trash2 size={13} style={{ color: "var(--danger)" }} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
