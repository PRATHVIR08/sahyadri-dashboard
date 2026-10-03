import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react";
import { BookOpen, ExternalLink, FolderKanban, Github, Layers, Lightbulb, Sparkles } from "lucide-react";
import { api } from "../api";

export default function Projects() {
  const { kind = "problems" } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const kinds = [
    { id: "problems", label: "Problem Statements Pool", icon: Lightbulb },
    { id: "mini", label: "Mini & Major Projects", icon: FolderKanban },
    { id: "research", label: "Research Papers & Publications", icon: BookOpen },
  ];

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        let endpoint = "/api/problems";
        if (kind === "mini") endpoint = "/api/mini-projects";
        else if (kind === "research") endpoint = "/api/research";
        const res = await api(endpoint);
        setData(res);
      } catch (err) {
        setError(err.message || "Failed to load projects repository");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [kind]);

  return (
    <div className="fade-in">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <h1>Student Projects & Innovation Hub</h1>
          <p style={{ margin: 0 }}>Industry problem statements, student project repositories, and research publications.</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs" style={{ marginBottom: "1.25rem" }}>
        {kinds.map((k) => (
          <button
            key={k.id}
            className={`tab ${kind === k.id ? "active" : ""}`}
            onClick={() => navigate(`/projects/${k.id}`)}
          >
            <k.icon size={14} style={{ marginRight: "0.3rem" }} /> {k.label}
          </button>
        ))}
      </div>

      {error && <div className="error" style={{ marginBottom: "1rem" }}>{error}</div>}

      {/* Problems / Mini Projects / Research Cards */}
      {kind === "problems" ? (
        <div className="grid grid-2">
          {data.length === 0 ? (
            <div className="card empty" style={{ gridColumn: "span 2" }}>
              No problem statements available right now.
            </div>
          ) : (
            data.map((item) => (
              <div key={item.id} className="card">
                <div className="row" style={{ justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <span className="badge ok">{item.department}</span>
                  {item.company_sponsor && <span className="badge neutral">Sponsor: {item.company_sponsor}</span>}
                </div>
                <h2>{item.title}</h2>
                <p style={{ fontSize: "0.85rem" }}>{item.description}</p>
                {item.tech_stack && (
                  <div className="chip-group" style={{ marginTop: "0.6rem" }}>
                    {(Array.isArray(item.tech_stack) ? item.tech_stack : item.tech_stack.split(",")).map((t, i) => (
                      <span key={i} className="chip">
                        <Sparkles size={11} /> {t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : kind === "mini" ? (
        <div className="grid grid-2">
          {data.length === 0 ? (
            <div className="card empty" style={{ gridColumn: "span 2" }}>
              No mini projects registered in repository yet.
            </div>
          ) : (
            data.map((item) => (
              <div key={item.id} className="card">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="badge ok">{item.department}</span>
                  {item.guide_name && <span className="badge neutral">Guide: {item.guide_name}</span>}
                </div>
                <h2>{item.title}</h2>
                {item.student_names && (
                  <p className="muted" style={{ fontSize: "0.8rem", margin: "0.2rem 0" }}>
                    Team: <strong>{item.student_names}</strong>
                  </p>
                )}
                <p style={{ fontSize: "0.85rem" }}>{item.description}</p>
                {item.github_url && (
                  <div style={{ marginTop: "1rem" }}>
                    <a
                      href={item.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn small ghost"
                      style={{ textDecoration: "none" }}
                    >
                      <Github size={13} style={{ marginRight: "0.2rem" }} /> GitHub Repository
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-2">
          {data.length === 0 ? (
            <div className="card empty" style={{ gridColumn: "span 2" }}>
              No research papers published yet.
            </div>
          ) : (
            data.map((item) => (
              <div key={item.id} className="card">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="badge ok">{item.journal_conference} ({item.year})</span>
                </div>
                <h2>{item.title}</h2>
                <p className="muted" style={{ fontSize: "0.82rem" }}>
                  Authors: <strong>{item.authors}</strong>
                </p>
                <p style={{ fontSize: "0.85rem" }}>{item.abstract}</p>
                {item.doi_url && (
                  <div style={{ marginTop: "1rem" }}>
                    <a
                      href={item.doi_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn small primary"
                      style={{ textDecoration: "none" }}
                    >
                      <ExternalLink size={13} style={{ marginRight: "0.2rem" }} /> View Paper / DOI Link
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
