import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  ListTodo,
  Minus,
  Plus,
  RefreshCw,
  Table as TableIcon,
  Zap,
} from "lucide-react";
import { api } from "../api";

export default function Attendance({ tab = "table" }) {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Bunk planner state
  const [bunkSubId, setBunkSubId] = useState("");
  const [targetPct, setTargetPct] = useState(85);
  const [plannedBunks, setPlannedBunks] = useState(1);
  const [extraAttend, setExtraAttend] = useState(0);
  const [bunkResult, setBunkResult] = useState(null);

  // Todo state
  const [todoList, setTodoList] = useState([]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await api("/api/attendance");
      setData(res);
      if (res.length > 0 && !bunkSubId) {
        setBunkSubId(res[0].subject_id);
      }
    } catch (err) {
      setError(err.message || "Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (tab === "bunk" && bunkSubId) {
      calcBunk();
    } else if (tab === "todo") {
      loadTodo();
    }
  }, [tab, bunkSubId, targetPct, plannedBunks, extraAttend]);

  async function updateAttendance(subjectId, deltaAttended, deltaTotal) {
    try {
      await api("/api/attendance", {
        method: "POST",
        body: JSON.stringify({
          subject_id: subjectId,
          classes_attended_delta: deltaAttended,
          total_classes_delta: deltaTotal,
        }),
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  async function calcBunk() {
    if (!bunkSubId) return;
    try {
      const q = `?subject_id=${bunkSubId}&target_percentage=${targetPct}&planned_bunks=${plannedBunks}&extra_attend=${extraAttend}`;
      const res = await api(`/api/attendance/bunk${q}`);
      setBunkResult(res);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadTodo() {
    try {
      const res = await api("/api/attendance/todo");
      setTodoList(res);
    } catch (err) {
      setError(err.message);
    }
  }

  const overallAttended = data.reduce((s, r) => s + r.classes_attended, 0);
  const overallTotal = data.reduce((s, r) => s + r.total_classes, 0);
  const overallPct = overallTotal > 0 ? ((overallAttended / overallTotal) * 100).toFixed(1) : 0;

  return (
    <div className="fade-in">
      {/* Top Header */}
      <div className="row" style={{ justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <h1>Attendance & Bunk Management</h1>
          <p style={{ margin: 0 }}>Track subject attendance, simulate future bunks, and fulfill minimum targets.</p>
        </div>
        <div className="card row" style={{ padding: "0.5rem 1rem", background: "var(--card)" }}>
          <span className="muted" style={{ fontSize: "0.8rem" }}>Overall Attendance:</span>
          <strong style={{ fontSize: "1.2rem", color: overallPct >= 85 ? "var(--ok)" : overallPct >= 75 ? "var(--warn)" : "var(--danger)" }}>
            {overallPct}%
          </strong>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="tabs">
        <button className={`tab ${tab === "table" ? "active" : ""}`} onClick={() => navigate("/academics/attendance")}>
          <TableIcon size={14} style={{ marginRight: "0.3rem" }} /> Attendance Overview
        </button>
        <button className={`tab ${tab === "calc" ? "active" : ""}`} onClick={() => navigate("/academics/calculator")}>
          <Calculator size={14} style={{ marginRight: "0.3rem" }} /> Target Simulator
        </button>
        <button className={`tab ${tab === "bunk" ? "active" : ""}`} onClick={() => navigate("/academics/bunk")}>
          <Zap size={14} style={{ marginRight: "0.3rem" }} /> Planned Bunk Calculator
        </button>
        <button className={`tab ${tab === "todo" ? "active" : ""}`} onClick={() => navigate("/academics/todo")}>
          <ListTodo size={14} style={{ marginRight: "0.3rem" }} /> Attendance To-Do
        </button>
      </div>

      {error && <div className="error" style={{ marginBottom: "1rem" }}>{error}</div>}

      {/* TAB 1: Attendance Table */}
      {tab === "table" && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Code</th>
                  <th>Faculty</th>
                  <th>Attended / Total</th>
                  <th>Percentage</th>
                  <th>Status</th>
                  <th>Max Bunks</th>
                  <th>Classes Needed</th>
                  <th>Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.subject}</strong>
                      <div className="muted" style={{ fontSize: "0.75rem" }}>Credits: {row.credits}</div>
                    </td>
                    <td>{row.code}</td>
                    <td>{row.faculty}</td>
                    <td>
                      <strong>{row.classes_attended}</strong> / {row.total_classes}
                    </td>
                    <td>
                      <div className="row" style={{ gap: "0.4rem" }}>
                        <strong>{row.percentage}%</strong>
                        <div className="progress-bg" style={{ width: "60px" }}>
                          <div
                            className={`progress-fill ${row.status === "safe" ? "ok" : row.status === "warning" ? "warn" : "risk"}`}
                            style={{ width: `${Math.min(row.percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${row.status === "safe" ? "ok" : row.status === "warning" ? "warn" : "risk"}`}>
                        {row.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {row.max_bunks > 0 ? (
                        <span style={{ color: "var(--ok)", fontWeight: 600 }}>{row.max_bunks} classes</span>
                      ) : (
                        <span className="muted">0</span>
                      )}
                    </td>
                    <td>
                      {row.classes_needed > 0 ? (
                        <span style={{ color: "var(--danger)", fontWeight: 600 }}>{row.classes_needed} classes</span>
                      ) : (
                        <span className="muted">None</span>
                      )}
                    </td>
                    <td>
                      <div className="row" style={{ gap: "0.25rem" }}>
                        <button
                          className="btn small primary"
                          title="Attended today's class"
                          onClick={() => updateAttendance(row.subject_id, 1, 1)}
                        >
                          + Attended
                        </button>
                        <button
                          className="btn small ghost"
                          title="Missed today's class"
                          onClick={() => updateAttendance(row.subject_id, 0, 1)}
                        >
                          + Bunked
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Attendance Calculator Simulator */}
      {tab === "calc" && (
        <div className="grid grid-2">
          <div className="card">
            <h2>Simulate Class Attendance</h2>
            <p style={{ fontSize: "0.85rem" }}>Select a subject to test how attending or bunking upcoming classes impacts your percentage.</p>
            {data.length > 0 && (
              <div className="form">
                <div className="field">
                  <label>Select Subject</label>
                  <select value={bunkSubId} onChange={(e) => setBunkSubId(parseInt(e.target.value))}>
                    {data.map((r) => (
                      <option key={r.id} value={r.subject_id}>
                        {r.subject} ({r.code}) — Current: {r.percentage}%
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Classes you plan to ATTEND next</label>
                  <input type="number" min="0" value={extraAttend} onChange={(e) => setExtraAttend(parseInt(e.target.value) || 0)} />
                </div>
                <div className="field">
                  <label>Classes you plan to BUNK next</label>
                  <input type="number" min="0" value={plannedBunks} onChange={(e) => setPlannedBunks(parseInt(e.target.value) || 0)} />
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h2>Simulation Results</h2>
            {bunkResult ? (
              <div>
                <div className="card" style={{ background: "#fbf8f0", marginBottom: "1rem" }}>
                  <span className="muted" style={{ fontSize: "0.8rem" }}>Subject</span>
                  <h3 style={{ margin: "0.2rem 0" }}>{bunkResult.subject}</h3>
                  <div className="row" style={{ gap: "1rem", marginTop: "0.5rem" }}>
                    <div>
                      <span className="muted" style={{ fontSize: "0.75rem" }}>Current %</span>
                      <p style={{ margin: 0, fontWeight: 700 }}>{bunkResult.current_percentage}%</p>
                    </div>
                    <div style={{ fontSize: "1.4rem", color: "var(--muted)" }}>→</div>
                    <div>
                      <span className="muted" style={{ fontSize: "0.75rem" }}>New % After Action</span>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 700,
                          fontSize: "1.2rem",
                          color: bunkResult.new_percentage >= 75 ? "var(--ok)" : "var(--danger)",
                        }}
                      >
                        {bunkResult.new_percentage}%
                      </p>
                    </div>
                  </div>
                </div>
                <p>
                  <strong>Attended/Total:</strong> {bunkResult.classes_attended} / {bunkResult.total_classes}
                </p>
                <div className={`badge ${bunkResult.new_percentage >= 75 ? "ok" : "risk"}`} style={{ fontSize: "0.85rem", padding: "0.5rem" }}>
                  {bunkResult.advice}
                </div>
              </div>
            ) : (
              <div className="empty">Select subject and adjustments to simulate</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Planned Bunk Calculator */}
      {tab === "bunk" && (
        <div className="card">
          <h2>Planned Bunk Planner & Safety Margin</h2>
          <p style={{ fontSize: "0.85rem" }}>Calculate exact bunks remaining before dropping below target threshold.</p>

          <div className="grid grid-3" style={{ marginBottom: "1.25rem", marginTop: "1rem" }}>
            <div className="field">
              <label>Subject</label>
              <select value={bunkSubId} onChange={(e) => setBunkSubId(parseInt(e.target.value))}>
                {data.map((r) => (
                  <option key={r.id} value={r.subject_id}>
                    {r.subject} ({r.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Target Threshold %</label>
              <select value={targetPct} onChange={(e) => setTargetPct(parseInt(e.target.value))}>
                <option value={75}>75% (VTU Minimum)</option>
                <option value={80}>80% (Safe Buffer)</option>
                <option value={85}>85% (College Standard)</option>
                <option value={90}>90% (High Honors Target)</option>
              </select>
            </div>

            <div className="field">
              <label>Number of Bunks to Test</label>
              <input type="number" min="1" max="30" value={plannedBunks} onChange={(e) => setPlannedBunks(parseInt(e.target.value) || 1)} />
            </div>
          </div>

          {bunkResult && (
            <div className="card" style={{ background: "#fbf6ea" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <span className="muted" style={{ fontSize: "0.8rem" }}>Subject: {bunkResult.subject}</span>
                  <h3>Resulting Percentage: {bunkResult.new_percentage}%</h3>
                  <p>{bunkResult.advice}</p>
                </div>
                <div>
                  <span className={`badge ${bunkResult.is_safe ? "ok" : "risk"}`} style={{ fontSize: "1rem", padding: "0.6rem 1rem" }}>
                    {bunkResult.is_safe ? "SAFE TO BUNK" : "RISKY BUNK"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Attendance To-Do List */}
      {tab === "todo" && (
        <div className="card">
          <h2>Attendance To-Do Action Plan</h2>
          <p style={{ fontSize: "0.85rem" }}>Required classes per subject to maintain minimum 75% attendance threshold.</p>

          <div className="table-wrap" style={{ marginTop: "1rem" }}>
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Current %</th>
                  <th>Status</th>
                  <th>Classes to Attend</th>
                  <th>Classes Safe to Miss</th>
                  <th>Priority Action</th>
                </tr>
              </thead>
              <tbody>
                {todoList.map((item) => (
                  <tr key={item.subject_id}>
                    <td>
                      <strong>{item.subject}</strong> ({item.code})
                    </td>
                    <td>{item.percentage}%</td>
                    <td>
                      <span className={`badge ${item.status === "safe" ? "ok" : item.status === "warning" ? "warn" : "risk"}`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {item.classes_needed > 0 ? (
                        <strong style={{ color: "var(--danger)" }}>Must attend next {item.classes_needed} classes</strong>
                      ) : (
                        <span className="muted">0</span>
                      )}
                    </td>
                    <td>
                      {item.max_bunks > 0 ? (
                        <strong style={{ color: "var(--ok)" }}>Can miss {item.max_bunks} classes</strong>
                      ) : (
                        <span className="muted">0</span>
                      )}
                    </td>
                    <td>
                      {item.classes_needed > 0 ? (
                        <span className="badge risk">CRITICAL: Do not miss!</span>
                      ) : (
                        <span className="badge ok">Safe buffer</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
