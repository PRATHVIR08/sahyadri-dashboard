import { useEffect, useState } from "react";
import { Mail, Search, Sparkles, UserCheck, Users } from "lucide-react";
import { api } from "../api";

export default function Network() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await api("/api/students/network");
        setStudents(data);
      } catch (err) {
        setError(err.message || "Failed to load student network");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase()) ||
      (Array.isArray(s.interests) && s.interests.some((i) => i.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="fade-in">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <h1>Sahyadri Peer Network & Collaboration</h1>
          <p style={{ margin: 0 }}>Discover fellow students across departments, share project ideas, and connect by shared interests.</p>
        </div>
      </div>

      {error && <div className="error" style={{ marginBottom: "1rem" }}>{error}</div>}

      {/* Search Input */}
      <div className="search" style={{ maxWidth: "500px", marginBottom: "1.25rem" }}>
        <input
          type="text"
          placeholder="Search by student name, interest tag (e.g. AI, Fullstack, Cyber), or department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Students Cards Grid */}
      <div className="grid grid-3">
        {filtered.map((s) => (
          <div key={s.id} className="card">
            <div className="row" style={{ gap: "0.8rem", marginBottom: "0.8rem" }}>
              {s.photo_url ? (
                <img
                  src={s.photo_url}
                  alt={s.name}
                  style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div className="avatar" style={{ width: "48px", height: "48px", fontSize: "1.1rem" }}>
                  {s.name?.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h3 style={{ margin: 0 }}>{s.name}</h3>
                <span className="muted" style={{ fontSize: "0.78rem" }}>
                  {s.usn} · Year {s.year} (Sem {s.semester})
                </span>
              </div>
            </div>

            <p style={{ fontSize: "0.82rem", margin: "0.2rem 0", color: "var(--forest)", fontWeight: 600 }}>
              {s.department}
            </p>

            <div className="chip-group" style={{ marginTop: "0.6rem" }}>
              {Array.isArray(s.interests) &&
                s.interests.map((interest, idx) => (
                  <span key={idx} className="chip">
                    <Sparkles size={11} /> {interest}
                  </span>
                ))}
            </div>

            <div style={{ marginTop: "1rem" }}>
              <a
                href={`mailto:${s.email}`}
                className="btn small ghost"
                style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
              >
                <Mail size={13} /> {s.email}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
