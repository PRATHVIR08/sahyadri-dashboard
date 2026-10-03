import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react";
import { Award, Calendar, Megaphone, Newspaper, Sparkles, UserCheck } from "lucide-react";
import { api } from "../api";

export default function Campus() {
  const { kind = "events" } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const kinds = [
    { id: "events", label: "Campus Events & Fests", icon: Calendar },
    { id: "news", label: "Sahyadri News & Circulars", icon: Newspaper },
    { id: "achievements", label: "Student Achievements", icon: Award },
    { id: "buzz", label: "Campus Buzz & Announcements", icon: Megaphone },
  ];

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        let endpoint = "/api/calendar";
        if (kind === "news") endpoint = "/api/news";
        else if (kind === "achievements") endpoint = "/api/achievements";
        else if (kind === "buzz") endpoint = "/api/announcements";
        const res = await api(endpoint);
        setData(res);
      } catch (err) {
        setError(err.message || "Failed to load campus updates");
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
          <h1>Sahyadri Campus Buzz & News</h1>
          <p style={{ margin: 0 }}>College fests, academic circulars, student victories, and campus updates.</p>
        </div>
      </div>

      {/* Kind Tabs */}
      <div className="tabs" style={{ marginBottom: "1.25rem" }}>
        {kinds.map((k) => (
          <button
            key={k.id}
            className={`tab ${kind === k.id ? "active" : ""}`}
            onClick={() => navigate(`/campus/${k.id}`)}
          >
            <k.icon size={14} style={{ marginRight: "0.3rem" }} /> {k.label}
          </button>
        ))}
      </div>

      {error && <div className="error" style={{ marginBottom: "1rem" }}>{error}</div>}

      {/* Events / News / Achievements / Buzz Cards */}
      <div className="grid grid-2">
        {data.length === 0 ? (
          <div className="card empty" style={{ gridColumn: "span 2" }}>
            No posts found for this campus section.
          </div>
        ) : (
          data.map((item) => (
            <div key={item.id} className="card">
              <div className="row" style={{ justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span className="badge ok">
                  {item.category || item.achievement_type || "Sahyadri Update"}
                </span>
                <span className="muted" style={{ fontSize: "0.75rem" }}>
                  {item.published_at
                    ? new Date(item.published_at).toLocaleDateString()
                    : item.event_date
                    ? new Date(item.event_date).toLocaleDateString()
                    : "Recent"}
                </span>
              </div>

              <h2>{item.title}</h2>
              {item.student_name && (
                <p className="muted" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  <UserCheck size={14} style={{ verticalAlign: "middle", marginRight: "0.2rem" }} />
                  {item.student_name} ({item.department})
                </p>
              )}
              <p style={{ fontSize: "0.85rem" }}>{item.content || item.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
