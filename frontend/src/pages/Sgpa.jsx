import { useEffect, useState } from "react";
import { Award, Check, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import { api } from "../api";

const GRADE_POINTS = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  C: 5,
  P: 4,
  F: 0,
};

function getGradeFromMarks(m) {
  if (m >= 90) return "O";
  if (m >= 80) return "A+";
  if (m >= 70) return "A";
  if (m >= 60) return "B+";
  if (m >= 55) return "B";
  if (m >= 50) return "C";
  if (m >= 40) return "P";
  return "F";
}

export default function Sgpa() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api("/api/sgpa");
        if (res.subjects && res.subjects.length > 0) {
          setSubjects(res.subjects);
        } else {
          // Default semester subjects preset if empty
          setSubjects([
            { subject_name: "Software Engineering & Project Management", code: "21CS61", credits: 4, marks: 85, grade: "A+", predicted: false },
            { subject_name: "Full Stack Web Development", code: "21CS62", credits: 4, marks: 92, grade: "O", predicted: false },
            { subject_name: "Cloud Computing & DevOps", code: "21CS63", credits: 3, marks: 78, grade: "A", predicted: false },
            { subject_name: "Machine Learning Lab", code: "21CSL66", credits: 2, marks: 88, grade: "A+", predicted: false },
            { subject_name: "Mini Project", code: "21CSP67", credits: 2, marks: 95, grade: "O", predicted: false },
          ]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleSubjectChange(index, field, value) {
    const updated = [...subjects];
    const item = { ...updated[index], [field]: value };

    if (field === "marks") {
      const marksVal = parseInt(value) || 0;
      item.marks = marksVal;
      item.grade = getGradeFromMarks(marksVal);
    } else if (field === "grade") {
      item.grade = value;
    } else if (field === "credits") {
      item.credits = parseInt(value) || 1;
    }

    updated[index] = item;
    setSubjects(updated);
  }

  function addSubject() {
    setSubjects([
      ...subjects,
      { subject_name: "New Elective Course", code: "21ELE6" + (subjects.length + 1), credits: 3, marks: 80, grade: "A+", predicted: true },
    ]);
  }

  function removeSubject(index) {
    setSubjects(subjects.filter((_, i) => i !== index));
  }

  async function saveSgpa() {
    setSaving(true);
    setMsg("");
    setError("");
    try {
      const payload = {
        subjects: subjects.map((s) => ({
          subject_name: s.subject_name,
          code: s.code,
          credits: parseInt(s.credits) || 1,
          marks: parseInt(s.marks) || 0,
          grade: s.grade,
          predicted: !!s.predicted,
        })),
      };
      const res = await api("/api/sgpa", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setMsg("SGPA saved successfully!");
      if (res.subjects) setSubjects(res.subjects);
    } catch (err) {
      setError(err.message || "Failed to save SGPA calculations");
    } finally {
      setSaving(false);
    }
  }

  // Calculate SGPA dynamically on client
  let totalCredits = 0;
  let totalPoints = 0;

  subjects.forEach((s) => {
    const cr = parseInt(s.credits) || 0;
    const gp = GRADE_POINTS[s.grade] ?? 0;
    totalCredits += cr;
    totalPoints += cr * gp;
  });

  const calculatedSgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";

  return (
    <div className="fade-in" style={{ maxWidth: "960px" }}>
      {/* Top Banner */}
      <div className="row" style={{ justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <h1>SGPA Calculator & Estimator</h1>
          <p style={{ margin: 0 }}>Input your internal/external marks or predicted grades to estimate semester performance.</p>
        </div>
        <div className="card row" style={{ padding: "0.6rem 1.2rem", background: "var(--forest)", color: "#fff" }}>
          <Award size={24} style={{ color: "var(--gold-soft)" }} />
          <div>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#c9d8cf" }}>Estimated SGPA</span>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, fontFamily: "Fraunces, serif" }}>{calculatedSgpa}</div>
          </div>
        </div>
      </div>

      {msg && <div className="badge ok" style={{ width: "100%", padding: "0.6rem", marginBottom: "1rem" }}>{msg}</div>}
      {error && <div className="error" style={{ marginBottom: "1rem" }}>{error}</div>}

      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2>Semester Subjects & Grade Matrix</h2>
          <div className="row">
            <button className="btn ghost small" onClick={addSubject}>
              <Plus size={14} /> Add Elective / Subject
            </button>
            <button className="btn primary small" onClick={saveSgpa} disabled={saving}>
              <Save size={14} /> {saving ? "Saving…" : "Save SGPA Record"}
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Code</th>
                <th>Credits</th>
                <th>Marks (0-100)</th>
                <th>Grade</th>
                <th>Grade Points</th>
                <th>Total Points</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub, idx) => {
                const gp = GRADE_POINTS[sub.grade] ?? 0;
                const points = (parseInt(sub.credits) || 0) * gp;
                return (
                  <tr key={idx}>
                    <td>
                      <input
                        type="text"
                        style={{ width: "100%", border: "1px solid var(--line)", borderRadius: "8px", padding: "0.4rem" }}
                        value={sub.subject_name}
                        onChange={(e) => handleSubjectChange(idx, "subject_name", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        style={{ width: "80px", border: "1px solid var(--line)", borderRadius: "8px", padding: "0.4rem" }}
                        value={sub.code}
                        onChange={(e) => handleSubjectChange(idx, "code", e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        style={{ border: "1px solid var(--line)", borderRadius: "8px", padding: "0.4rem" }}
                        value={sub.credits}
                        onChange={(e) => handleSubjectChange(idx, "credits", e.target.value)}
                      >
                        {[1, 2, 3, 4, 5, 6].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        style={{ width: "75px", border: "1px solid var(--line)", borderRadius: "8px", padding: "0.4rem" }}
                        value={sub.marks}
                        onChange={(e) => handleSubjectChange(idx, "marks", e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        style={{ border: "1px solid var(--line)", borderRadius: "8px", padding: "0.4rem", fontWeight: 700 }}
                        value={sub.grade}
                        onChange={(e) => handleSubjectChange(idx, "grade", e.target.value)}
                      >
                        {Object.keys(GRADE_POINTS).map((g) => (
                          <option key={g} value={g}>
                            {g} ({GRADE_POINTS[g]})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <strong>{gp}</strong>
                    </td>
                    <td>
                      <strong style={{ color: "var(--forest)" }}>{points}</strong>
                    </td>
                    <td>
                      <span className={`badge ${sub.predicted ? "warn" : "ok"}`}>
                        {sub.predicted ? "Predicted" : "Official"}
                      </span>
                    </td>
                    <td>
                      <button className="btn ghost small" onClick={() => removeSubject(idx)} title="Delete subject">
                        <Trash2 size={14} style={{ color: "var(--danger)" }} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Conversion Scale & Formula Summary */}
      <div className="grid grid-2">
        <div className="card">
          <h2>VTU Grade Point Scale</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Marks Range</th>
                  <th>Grade</th>
                  <th>Grade Point</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>90% - 100%</td><td><span className="badge ok">O</span></td><td>10</td></tr>
                <tr><td>80% - 89%</td><td><span className="badge ok">A+</span></td><td>9</td></tr>
                <tr><td>70% - 79%</td><td><span className="badge ok">A</span></td><td>8</td></tr>
                <tr><td>60% - 69%</td><td><span className="badge warn">B+</span></td><td>7</td></tr>
                <tr><td>55% - 59%</td><td><span className="badge warn">B</span></td><td>6</td></tr>
                <tr><td>50% - 54%</td><td><span className="badge neutral">C</span></td><td>5</td></tr>
                <tr><td>40% - 49%</td><td><span className="badge neutral">P</span></td><td>4</td></tr>
                <tr><td>Below 40%</td><td><span className="badge risk">F</span></td><td>0</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2>SGPA Formula & Summary</h2>
          <div className="card" style={{ background: "#fdf8ee", marginBottom: "1rem" }}>
            <p style={{ margin: 0, fontFamily: "monospace", fontSize: "0.9rem" }}>
              SGPA = Σ (Course Credits × Grade Point) / Σ Total Credits
            </p>
          </div>
          <div className="list-item row" style={{ justifyContent: "space-between" }}>
            <span>Total Registered Credits:</span>
            <strong>{totalCredits}</strong>
          </div>
          <div className="list-item row" style={{ justifyContent: "space-between" }}>
            <span>Total Earned Points:</span>
            <strong>{totalPoints}</strong>
          </div>
          <div className="list-item row" style={{ justifyContent: "space-between" }}>
            <span>Calculated SGPA:</span>
            <strong style={{ fontSize: "1.2rem", color: "var(--forest)" }}>{calculatedSgpa}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
