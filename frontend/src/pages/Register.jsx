import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    usn: "",
    course: "B.E.",
    department: "Information Science & Engineering",
    year: 3,
    semester: 6,
    section: "A",
    interests: "Web Development, AI/ML, Cloud Computing",
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
    if (!form.email.toLowerCase().endsWith("@sahyadri.edu.in")) {
      setError("Please use an official college email address (@sahyadri.edu.in)");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...form,
        interests: form.interests.split(",").map((s) => s.trim()).filter(Boolean),
      };
      await register(payload);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to register. Please check your inputs.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card fade-in" style={{ maxWidth: "620px" }}>
        <span className="badge neutral" style={{ marginBottom: "0.5rem" }}>
          Sahyadri Student Portal
        </span>
        <h1>Create Student Account</h1>
        <p>Register with your official Sahyadri College email ID.</p>

        <form className="form" onSubmit={onSubmit}>
          {error && <div className="error">{error}</div>}

          <div className="grid-2">
            <div className="field">
              <label>College Email</label>
              <input
                type="email"
                name="email"
                placeholder="name.is.24@sahyadri.edu.in"
                value={form.email}
                onChange={onChange}
                required
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Full Student Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Prathvir Raj"
                value={form.name}
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
            <label>Interests & Domains (comma separated)</label>
            <input
              type="text"
              name="interests"
              placeholder="e.g. AI/ML, Web Dev, Mobile Apps, Robotics, Competitive Coding"
              value={form.interests}
              onChange={onChange}
            />
          </div>

          <button className="btn primary" type="submit" disabled={busy} style={{ marginTop: "0.5rem" }}>
            {busy ? "Registering account…" : "Create Student Account"}
          </button>
        </form>

        <p style={{ marginTop: "1rem", textAlign: "center" }}>
          Already registered? <Link to="/login">Sign in to portal</Link>
        </p>
      </div>
    </div>
  );
}
