import { useEffect, useState } from "react";
import { Calendar as CalendarIcon, Tag, Clock, Award, BookOpen } from "lucide-react";
import { api } from "../api";

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [filterCategory, setFilterCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await api("/api/calendar");
        setEvents(data);
      } catch (err) {
        setError(err.message || "Failed to load academic calendar");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = ["all", "academic", "exam", "fest", "holiday"];

  const filteredEvents = filterCategory === "all" ? events : events.filter((e) => e.category === filterCategory);

  return (
    <div className="fade-in">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <h1>Academic & Campus Calendar</h1>
          <p style={{ margin: 0 }}>Stay informed on internal tests, semester exams, holidays, and college events.</p>
        </div>
      </div>

      {error && <div className="error" style={{ marginBottom: "1rem" }}>{error}</div>}

      {/* Filter Tabs */}
      <div className="tabs" style={{ marginBottom: "1.25rem" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`tab ${filterCategory === cat ? "active" : ""}`}
            onClick={() => setFilterCategory(cat)}
          >
            {cat.toUpperCase()} ({cat === "all" ? events.length : events.filter((e) => e.category === cat).length})
          </button>
        ))}
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="card empty">No calendar events found for this category.</div>
      ) : (
        <div className="grid grid-2">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="card" style={{ borderLeft: `5px solid ${getCategoryColor(evt.category)}` }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="badge neutral" style={{ background: getCategoryBg(evt.category) }}>
                  <Tag size={12} /> {evt.category.toUpperCase()}
                </span>
                <span className="badge ok">
                  <CalendarIcon size={12} /> {new Date(evt.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>

              <h2 style={{ margin: "0.6rem 0 0.3rem" }}>{evt.title}</h2>
              {evt.description && <p style={{ fontSize: "0.85rem" }}>{evt.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getCategoryColor(cat) {
  switch (cat) {
    case "exam": return "var(--danger)";
    case "academic": return "var(--forest)";
    case "fest": return "var(--gold)";
    case "holiday": return "var(--warn)";
    default: return "var(--moss)";
  }
}

function getCategoryBg(cat) {
  switch (cat) {
    case "exam": return "#f8dede";
    case "academic": return "#e4f3ea";
    case "fest": return "#f8eccf";
    case "holiday": return "#fcf0d9";
    default: return "#ede6d8";
  }
}
