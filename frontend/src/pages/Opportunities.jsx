import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react";
import { Award, Briefcase, Calendar, DollarSign, ExternalLink, GraduationCap, MapPin } from "lucide-react";
import { api } from "../api";

export default function Opportunities() {
  const { kind = "placements" } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const kinds = [
    { id: "placements", label: "Campus Placements", icon: Briefcase },
    { id: "internships", label: "Internships", icon: Briefcase },
    { id: "vacancies", label: "Company Vacancies", icon: ExternalLink },
    { id: "higher-studies", label: "Higher Studies & GATE", icon: GraduationCap },
  ];

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        let endpoint = "/api/placements";
        if (kind === "vacancies") endpoint = "/api/vacancies";
        else if (kind === "higher-studies") endpoint = "/api/higher-studies";
        const res = await api(endpoint);
        setData(res);
      } catch (err) {
        setError(err.message || "Failed to load opportunities");
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
          <h1>Career & Higher Education Hub</h1>
          <p style={{ margin: 0 }}>On-campus placement drives, off-campus jobs, internship opportunities, and GATE/GRE guidance.</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs" style={{ marginBottom: "1.25rem" }}>
        {kinds.map((k) => (
          <button
            key={k.id}
            className={`tab ${kind === k.id ? "active" : ""}`}
            onClick={() => navigate(`/opportunities/${k.id}`)}
          >
            <k.icon size={14} style={{ marginRight: "0.3rem" }} /> {k.label}
          </button>
        ))}
      </div>

      {error && <div className="error" style={{ marginBottom: "1rem" }}>{error}</div>}

      {/* Render Placements / Internships */}
      {kind === "placements" || kind === "internships" ? (
        <div className="grid grid-2">
          {data.length === 0 ? (
            <div className="card empty" style={{ gridColumn: "span 2" }}>
              No active placement drives listed right now.
            </div>
          ) : (
            data.map((item) => (
              <div key={item.id} className="card" style={{ borderLeft: "5px solid var(--forest)" }}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span className="badge ok">
                    <DollarSign size={12} /> {item.package_lpa} LPA Package
                  </span>
                  <span className="badge neutral">
                    <Calendar size={12} /> Drive: {new Date(item.drive_date).toLocaleDateString()}
                  </span>
                </div>

                <h2>{item.company_name}</h2>
                <p style={{ fontWeight: 600, color: "var(--forest)", margin: "0.1rem 0" }}>{item.role}</p>

                <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>{item.description}</p>

                <div className="card" style={{ background: "#f8f5ee", marginTop: "0.8rem", padding: "0.6rem" }}>
                  <div className="row" style={{ justifyContent: "space-between", fontSize: "0.78rem" }}>
                    <span>
                      Min CGPA Required: <strong>{item.min_cgpa}</strong>
                    </span>
                    <span>
                      Eligible: <strong>{Array.isArray(item.eligible_branches) ? item.eligible_branches.join(", ") : item.eligible_branches}</strong>
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : kind === "vacancies" ? (
        <div className="grid grid-2">
          {data.length === 0 ? (
            <div className="card empty" style={{ gridColumn: "span 2" }}>
              No company vacancies listed right now.
            </div>
          ) : (
            data.map((item) => (
              <div key={item.id} className="card">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="badge neutral">
                    <MapPin size={12} /> {item.location}
                  </span>
                  {item.deadline && (
                    <span className="badge risk">Deadline: {new Date(item.deadline).toLocaleDateString()}</span>
                  )}
                </div>
                <h2>{item.company_name}</h2>
                <p style={{ fontWeight: 600, color: "var(--forest)", margin: "0.2rem 0" }}>{item.title}</p>
                {item.apply_link && (
                  <div style={{ marginTop: "1rem" }}>
                    <a
                      href={item.apply_link}
                      target="_blank"
                      rel="noreferrer"
                      className="btn small primary"
                      style={{ textDecoration: "none" }}
                    >
                      <ExternalLink size={13} style={{ marginRight: "0.2rem" }} /> Apply on Career Portal
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
              No higher studies resources listed right now.
            </div>
          ) : (
            data.map((item) => (
              <div key={item.id} className="card">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="badge ok">{item.exam_name}</span>
                  <span className="badge neutral">{item.resource_type}</span>
                </div>
                <h2>{item.title}</h2>
                <p style={{ fontSize: "0.85rem" }}>{item.description}</p>
                {item.link_url && (
                  <div style={{ marginTop: "1rem" }}>
                    <a
                      href={item.link_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn small gold"
                      style={{ textDecoration: "none" }}
                    >
                      <ExternalLink size={13} style={{ marginRight: "0.2rem" }} /> Open Resource Link
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
