import { useEffect, useState } from "react";
import { Code2, ExternalLink, Github, Heart, Linkedin, ShieldCheck, Sparkles } from "lucide-react";
import { api } from "../api";

export default function Credits() {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await api("/api/developers");
        setDevelopers(data);
      } catch (err) {
        setError(err.message || "Failed to load developer credits");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="fade-in" style={{ maxWidth: "900px" }}>
      {/* Hero Header */}
      <div className="hero-card" style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
        <span className="badge neutral" style={{ marginBottom: "0.8rem" }}>
          <Code2 size={13} /> CREATED FOR SAHYADRI COLLEGE
        </span>
        <h1 style={{ fontSize: "2.2rem" }}>Sahyadri Student Portal Team</h1>
        <p style={{ maxWidth: "600px", margin: "0.5rem auto 0", fontSize: "0.95rem" }}>
          Engineered with passion to unify academics, attendance tracking, placements, study resources, and student collaboration.
        </p>
      </div>

      {error && <div className="error" style={{ marginBottom: "1rem" }}>{error}</div>}

      {/* Developer Cards Grid */}
      <div className="grid grid-2" style={{ marginBottom: "2rem" }}>
        {developers.map((dev) => (
          <div key={dev.id} className="card" style={{ borderTop: "4px solid var(--forest)" }}>
            <div className="row" style={{ gap: "1rem", marginBottom: "0.8rem" }}>
              <div className="avatar" style={{ width: "54px", height: "54px", fontSize: "1.2rem" }}>
                {dev.name?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="badge ok">{dev.role}</span>
                <h2 style={{ margin: "0.2rem 0" }}>{dev.name}</h2>
                <span className="muted" style={{ fontSize: "0.8rem" }}>{dev.usn}</span>
              </div>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--ink)" }}>{dev.bio}</p>

            <div className="row" style={{ marginTop: "1rem", gap: "0.5rem" }}>
              {dev.github_url && (
                <a
                  href={dev.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn small ghost"
                  style={{ textDecoration: "none" }}
                >
                  <Github size={13} style={{ marginRight: "0.2rem" }} /> GitHub Profile
                </a>
              )}
              {dev.linkedin_url && (
                <a
                  href={dev.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn small ghost"
                  style={{ textDecoration: "none" }}
                >
                  <Linkedin size={13} style={{ marginRight: "0.2rem" }} /> LinkedIn
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stack & Platform Acknowledgments */}
      <div className="card">
        <h2>Technology & Architectural Stack</h2>
        <div className="grid grid-3" style={{ marginTop: "0.8rem" }}>
          <div className="card" style={{ background: "#faf7f0" }}>
            <strong style={{ color: "var(--forest)", display: "block" }}>Frontend Framework</strong>
            <p style={{ fontSize: "0.8rem", margin: "0.2rem 0 0" }}>React 18, Vite, React Router 6, Lucide React Icons</p>
          </div>

          <div className="card" style={{ background: "#faf7f0" }}>
            <strong style={{ color: "var(--forest)", display: "block" }}>Backend API Engine</strong>
            <p style={{ fontSize: "0.8rem", margin: "0.2rem 0 0" }}>Python FastAPI, SQLAlchemy ORM, Pydantic, OAuth2 JWT</p>
          </div>

          <div className="card" style={{ background: "#faf7f0" }}>
            <strong style={{ color: "var(--forest)", display: "block" }}>Database & Cloud</strong>
            <p style={{ fontSize: "0.8rem", margin: "0.2rem 0 0" }}>Supabase PostgreSQL, RLS Policies, SQLite Local Seed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
