import { useEffect, useState } from "react";
import { Calendar, CheckCircle, Clock, MapPin, User, XCircle } from "lucide-react";
import { api } from "../api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Timetable() {
  const [slots, setSlots] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 0 : new Date().getDay() - 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    try {
      const data = await api("/api/timetable");
      setSlots(data);
    } catch (err) {
      setError(err.message || "Failed to load timetable");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function logAttendance(slotId, attended) {
    setMsg("");
    try {
      await api("/api/timetable/attendance", {
        method: "POST",
        body: JSON.stringify({ slot_id: slotId, attended }),
      });
      setMsg(`Attendance ${attended ? "marked PRESENT" : "marked ABSENT"} for subject!`);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  const filteredSlots = slots.filter((s) => s.day_of_week === selectedDay);

  return (
    <div className="fade-in">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <h1>Weekly Class Timetable</h1>
          <p style={{ margin: 0 }}>View schedule by day and log class attendance directly.</p>
        </div>
        <span className="badge neutral">
          <Calendar size={14} /> Semester Schedule
        </span>
      </div>

      {msg && <div className="badge ok" style={{ width: "100%", padding: "0.6rem", marginBottom: "1rem" }}>{msg}</div>}
      {error && <div className="error" style={{ marginBottom: "1rem" }}>{error}</div>}

      {/* Day Selector Buttons */}
      <div className="tabs" style={{ marginBottom: "1.25rem" }}>
        {DAYS.map((dayName, index) => {
          const count = slots.filter((s) => s.day_of_week === index).length;
          return (
            <button
              key={dayName}
              className={`tab ${selectedDay === index ? "active" : ""}`}
              onClick={() => setSelectedDay(index)}
            >
              {dayName} ({count})
            </button>
          );
        })}
      </div>

      {/* Timetable Cards Grid */}
      {filteredSlots.length === 0 ? (
        <div className="card empty">No classes scheduled for {DAYS[selectedDay]}.</div>
      ) : (
        <div className="grid grid-2">
          {filteredSlots.map((slot) => (
            <div key={slot.id} className="card" style={{ borderLeft: "5px solid var(--forest)" }}>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span className="badge neutral">
                  <Clock size={12} /> {slot.start_time} - {slot.end_time}
                </span>
                <span className="badge ok">
                  <MapPin size={12} /> Room {slot.room_number}
                </span>
              </div>

              <h2 style={{ margin: "0.4rem 0 0.2rem" }}>{slot.subject_name}</h2>
              <p className="muted" style={{ fontSize: "0.82rem", margin: 0 }}>
                Subject Code: <strong>{slot.subject_code}</strong>
              </p>

              <div className="row" style={{ marginTop: "0.8rem", justifyContent: "space-between", alignItems: "center" }}>
                <div className="row" style={{ gap: "0.4rem" }}>
                  <User size={14} className="muted" />
                  <span style={{ fontSize: "0.85rem" }}>{slot.faculty}</span>
                </div>
                <div className="row" style={{ gap: "0.3rem" }}>
                  <button className="btn small primary" onClick={() => logAttendance(slot.id, true)}>
                    <CheckCircle size={13} /> Present
                  </button>
                  <button className="btn small ghost" onClick={() => logAttendance(slot.id, false)}>
                    <XCircle size={13} /> Absent
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
