import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Megaphone,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { api } from "../api";
import { useAuth } from "../auth";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api("/api/dashboard");
        setData(res);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="empty">Loading your personalized dashboard…</div>;
  if (error) return <div className="error">{error}</div>;
  if (!data) return <div className="empty">No dashboard data available.</div>;

  const { student, overall_attendance, current_sgpa, today_classes, next_class, upcoming_exams, announcements, news, placements, attendance_alerts } = data;

  const attStatus = overall_attendance >= 85 ? "ok" : overall_attendance >= 75 ? "warn" : "risk";

  return (
    <div className="fade-in">
      {/* Hero Welcome Banner */}
      <div className="hero-card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="row" style={{ gap: "0.4rem", marginBottom: "0.4rem" }}>
              <span className="badge neutral">
                <GraduationCap size={13} /> {student.department}
              </span>
              <span className="badge neutral">
                Year {student.year} · Sem {student.semester} {student.section}
              </span>
            </div>
            <h1>Welcome back, {student.name}!</h1>
            <p style={{ margin: 0 }}>
              USN: <strong>{student.usn}</strong> · {student.course} Student Portal
            </p>
          </div>
          {student.photo_url && (
            <img
              src={student.photo_url}
              alt={student.name}
              style={{ width: "60px", height: "60px", borderRadius: "50%", border: "2px solid #fff", objectFit: "cover" }}
            />
          )}
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-4" style={{ marginBottom: "1.25rem" }}>
        <div className="card stat">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="label">Overall Attendance</span>
            <span className={`badge ${attStatus}`}>{overall_attendance}%</span>
          </div>
          <div className="value">{overall_attendance}%</div>
          <div className="progress-bg">
            <div className={`progress-fill ${attStatus}`} style={{ width: `${Math.min(overall_attendance, 100)}%` }}></div>
          </div>
          <p className="muted" style={{ fontSize: "0.75rem", margin: 0 }}>
            {attStatus === "ok" ? "Excellent! Above target threshold." : attStatus === "warn" ? "Above 75%, but watch out!" : "Critical! Attendance low."}
          </p>
        </div>

        <div className="card stat">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="label">Current SGPA</span>
            <Award size={18} style={{ color: "var(--gold)" }} />
          </div>
          <div className="value">{current_sgpa ? current_sgpa.toFixed(2) : "N/A"}</div>
          <p className="muted" style={{ fontSize: "0.75rem", margin: 0 }}>
            <Link to="/academics/sgpa">Calculate / Predict SGPA →</Link>
          </p>
        </div>

        <div className="card stat">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="label">Next Class</span>
            <Clock size={18} style={{ color: "var(--forest)" }} />
          </div>
          <div className="value" style={{ fontSize: "1.25rem" }}>
            {next_class ? next_class.subject_name || next_class.subject_code : "No more today"}
          </div>
          <p className="muted" style={{ fontSize: "0.75rem", margin: 0 }}>
            {next_class ? `${next_class.start_time} - ${next_class.end_time} (${next_class.room_number})` : "Enjoy your rest of the day!"}
          </p>
        </div>

        <div className="card stat">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="label">Attendance Alerts</span>
            <AlertTriangle size={18} style={{ color: attendance_alerts?.length ? "var(--danger)" : "var(--ok)" }} />
          </div>
          <div className="value" style={{ color: attendance_alerts?.length ? "var(--danger)" : "var(--ok)" }}>
            {attendance_alerts?.length || 0}
          </div>
          <p className="muted" style={{ fontSize: "0.75rem", margin: 0 }}>
            {attendance_alerts?.length ? "Subjects below target percentage" : "All subjects in safe zone"}
          </p>
        </div>
      </div>

      {/* Attendance Warnings alert banner if any */}
      {attendance_alerts?.length > 0 && (
        <div className="card" style={{ marginBottom: "1.25rem", borderLeft: "5px solid var(--danger)", background: "#fdf6f6" }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <div className="row">
              <AlertTriangle style={{ color: "var(--danger)" }} size={20} />
              <strong style={{ color: "var(--danger)" }}>Attendance Action Required</strong>
            </div>
            <Link to="/academics/bunk" className="btn small gold">
              Open Bunk Planner
            </Link>
          </div>
          <div className="grid grid-3">
            {attendance_alerts.map((a) => (
              <div key={a.id} className="card" style={{ background: "#fff" }}>
                <strong>{a.subject} ({a.code})</strong>
                <div className="row" style={{ justifyContent: "space-between", marginTop: "0.4rem" }}>
                  <span className="muted" style={{ fontSize: "0.8rem" }}>Current: {a.percentage}%</span>
                  <span className={`badge ${a.status === "risk" ? "risk" : "warn"}`}>{a.status}</span>
                </div>
                {a.classes_needed > 0 ? (
                  <p style={{ fontSize: "0.78rem", color: "var(--danger)", margin: "0.3rem 0 0" }}>
                    Must attend <strong>{a.classes_needed}</strong> consecutive classes!
                  </p>
                ) : (
                  <p style={{ fontSize: "0.78rem", color: "var(--warn)", margin: "0.3rem 0 0" }}>
                    Can bunk max <strong>{a.max_bunks}</strong> classes safely.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Layout Grid */}
      <div className="grid grid-2" style={{ marginBottom: "1.25rem" }}>
        {/* Today's Timetable */}
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: "0.8rem" }}>
            <h2>
              <Clock size={18} style={{ verticalAlign: "middle", marginRight: "0.4rem" }} />
              Today's Schedule
            </h2>
            <Link to="/academics/timetable" style={{ fontSize: "0.8rem" }}>
              Full Timetable →
            </Link>
          </div>

          {today_classes?.length === 0 ? (
            <div className="empty">No classes scheduled for today!</div>
          ) : (
            <div>
              {today_classes.map((slot) => (
                <div key={slot.id} className="list-item row" style={{ justifyContent: "space-between" }}>
                  <div>
                    <strong>{slot.subject_name}</strong> ({slot.subject_code})
                    <p className="muted" style={{ fontSize: "0.78rem", margin: "0.1rem 0 0" }}>
                      Room: {slot.room_number} · Faculty: {slot.faculty}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className="badge neutral">
                      {slot.start_time} - {slot.end_time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tools & Portal Shortcuts */}
        <div className="card">
          <h2>
            <Sparkles size={18} style={{ verticalAlign: "middle", marginRight: "0.4rem" }} />
            Quick Shortcuts
          </h2>
          <div className="grid grid-2" style={{ marginTop: "0.8rem" }}>
            <Link to="/academics/calculator" className="card" style={{ textDecoration: "none", color: "inherit", background: "#fcfaf4" }}>
              <BookOpen size={20} style={{ color: "var(--forest)", marginBottom: "0.3rem" }} />
              <strong style={{ display: "block", fontSize: "0.9rem" }}>Attendance Simulator</strong>
              <span className="muted" style={{ fontSize: "0.75rem" }}>Simulate target % and missed classes</span>
            </Link>

            <Link to="/resources/papers" className="card" style={{ textDecoration: "none", color: "inherit", background: "#fcfaf4" }}>
              <TrendingUp size={20} style={{ color: "var(--gold)", marginBottom: "0.3rem" }} />
              <strong style={{ display: "block", fontSize: "0.9rem" }}>Question Papers</strong>
              <span className="muted" style={{ fontSize: "0.75rem" }}>Previous years VTU/Sahyadri papers</span>
            </Link>

            <Link to="/opportunities/placements" className="card" style={{ textDecoration: "none", color: "inherit", background: "#fcfaf4" }}>
              <Briefcase size={20} style={{ color: "var(--moss)", marginBottom: "0.3rem" }} />
              <strong style={{ display: "block", fontSize: "0.9rem" }}>Campus Placements</strong>
              <span className="muted" style={{ fontSize: "0.75rem" }}>Active drives & eligibility stats</span>
            </Link>

            <Link to="/lost-found" className="card" style={{ textDecoration: "none", color: "inherit", background: "#fcfaf4" }}>
              <CheckCircle2 size={20} style={{ color: "var(--warn)", marginBottom: "0.3rem" }} />
              <strong style={{ display: "block", fontSize: "0.9rem" }}>Lost & Found</strong>
              <span className="muted" style={{ fontSize: "0.75rem" }}>Report or claim lost campus items</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Announcements & Placement Drives Grid */}
      <div className="grid grid-2">
        {/* Campus Announcements */}
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: "0.8rem" }}>
            <h2>
              <Megaphone size={18} style={{ verticalAlign: "middle", marginRight: "0.4rem" }} />
              Latest Announcements
            </h2>
            <Link to="/campus/buzz" style={{ fontSize: "0.8rem" }}>
              View All →
            </Link>
          </div>

          {announcements?.length === 0 ? (
            <div className="empty">No active announcements</div>
          ) : (
            <div>
              {announcements.map((a) => (
                <div key={a.id} className="list-item">
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <strong>{a.title}</strong>
                    <span className="badge neutral" style={{ fontSize: "0.7rem" }}>
                      {a.category}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.82rem", margin: "0.2rem 0" }}>{a.content}</p>
                  <span className="muted" style={{ fontSize: "0.72rem" }}>
                    Posted on {new Date(a.published_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Placements & Drives */}
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: "0.8rem" }}>
            <h2>
              <Briefcase size={18} style={{ verticalAlign: "middle", marginRight: "0.4rem" }} />
              Upcoming Placement Drives
            </h2>
            <Link to="/opportunities/placements" style={{ fontSize: "0.8rem" }}>
              Explore Drives →
            </Link>
          </div>

          {placements?.length === 0 ? (
            <div className="empty">No upcoming placement drives listed right now.</div>
          ) : (
            <div>
              {placements.map((p) => (
                <div key={p.id} className="list-item row" style={{ justifyContent: "space-between" }}>
                  <div>
                    <strong>{p.company_name}</strong> — {p.role}
                    <p className="muted" style={{ fontSize: "0.78rem", margin: "0.1rem 0 0" }}>
                      Package: <strong>{p.package_lpa} LPA</strong> · Min CGPA: {p.min_cgpa}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className="badge ok">
                      Drive: {new Date(p.drive_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
