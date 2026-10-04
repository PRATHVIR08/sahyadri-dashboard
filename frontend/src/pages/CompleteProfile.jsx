import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function CompleteProfile() {
  const { user, saveProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: user?.full_name || user?.name || "",
    usn: "",
    course: "B.E.",
    department: "Information Science & Engineering",
    year: 3,
    semester: 6,
    section: "A",
    interests: "Web Development, AI/ML, Data Science",
    avatar_url: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "year" || name === "semester" ? parseInt(value) || 1 : value,
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.full_name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!form.usn.trim()) {
      setError("Please enter your USN.");
      return;
    }

    setBusy(true);
    try {
      await saveProfile(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to save profile. Please check your inputs.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card fade-in" style={{ maxWidth: "620px" }}>
        <span className="badge neutral" style={{ marginBottom: "0.5rem" }}>
          Action Required
        </span>
        <h1>Complete Your Student Profile</h1>
        <p>Please provide your academic details to access the Sahyadri Dashboard.</p>

        <form className="form" onSubmit={onSubmit}>
          {error && <div className="error">{error}</div>}

          <div className="field">
            <label>College Email</label>
            <input type="email" value={user?.email || ""} disabled readOnly style={{ opacity: 0.7 }} />
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Full Student Name</label>
              <input
                type="text"
                name="full_name"
                placeholder="e.g. Prathvir Raj"
                value={form.full_name}
                onChange={onChange}
                required
              />
            </div>

            <div className="field">
              <label>USN</label>
              <input
                type="text"
                name="usn"
                placeholder="e.g. 4SF24IS042"
                value={form.usn}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Course</label>
              <select name="course" value={form.course} onChange={onChange}>
                <option value="B.E.">B.E. (Bachelor of Engineering)</option>
                <option value="M.Tech">M.Tech</option>
                <option value="MBA">MBA</option>
                <option value="MCA">MCA</option>
              </select>
            </div>

            <div className="field">
              <label>Department</label>
              <select name="department" value={form.department} onChange={onChange}>
                <option value="Information Science & Engineering">Information Science & Engineering</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Artificial Intelligence & Machine Learning">Artificial Intelligence & Machine Learning</option>
                <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Data Science">Data Science</option>
              </select>
            </div>
          </div>

          <div className="grid-3">
            <div className="field">
              <label>Year of Study</label>
              <select name="year" value={form.year} onChange={onChange}>
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>

            <div className="field">
              <label>Semester</label>
              <select name="semester" value={form.semester} onChange={onChange}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Section</label>
              <select name="section" value={form.section} onChange={onChange}>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Interests & Skills (comma separated)</label>
            <input
              type="text"
              name="interests"
              placeholder="e.g. AI/ML, Web Dev, Mobile Apps, Competitive Coding"
              value={form.interests}
              onChange={onChange}
            />
          </div>

          <div className="field">
            <label>Profile Avatar URL (Optional)</label>
            <input
              type="url"
              name="avatar_url"
              placeholder="https://..."
              value={form.avatar_url}
              onChange={onChange}
            />
          </div>

          <button className="btn primary" type="submit" disabled={busy} style={{ marginTop: "0.5rem" }}>
            {busy ? "Saving Profile…" : "Complete Profile & Enter Portal"}
          </button>
        </form>
      </div>
    </div>
  );
}
