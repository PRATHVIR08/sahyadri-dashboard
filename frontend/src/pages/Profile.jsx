import { useEffect, useState } from "react";
import { User, Mail, Award, BookOpen, Layers, Sparkles, Check, Edit3 } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../auth";

export default function Profile() {
  const { user, refresh } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    section: "A",
    semester: 6,
    year: 3,
    interests: "",
    photo_url: "",
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await api("/api/auth/me");
        setProfile(data);
        setForm({
          name: data.name || "",
          section: data.section || "A",
          semester: data.semester || 6,
          year: data.year || 3,
          interests: Array.isArray(data.interests) ? data.interests.join(", ") : data.interests || "",
          photo_url: data.photo_url || "",
        });
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "year" || name === "semester" ? parseInt(value) || 1 : value,
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        ...form,
        interests: form.interests.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const updated = await api("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setProfile(updated);
      await refresh();
      setEditing(false);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setBusy(false);
    }
  }

  if (error && !profile) return <div className="error">{error}</div>;
  if (!profile) return <div className="empty">Loading student profile…</div>;

  return (
    <div className="fade-in" style={{ maxWidth: "840px" }}>
      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <div className="row" style={{ gap: "1.25rem" }}>
            {profile.photo_url ? (
              <img
                src={profile.photo_url}
                alt={profile.name}
                style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "3px solid var(--forest)" }}
              />
            ) : (
              <div
                className="avatar"
                style={{ width: "80px", height: "80px", fontSize: "1.8rem" }}
              >
                {profile.name?.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <span className="badge neutral" style={{ marginBottom: "0.2rem" }}>
                {profile.role.toUpperCase()} ACCOUNT
              </span>
              <h1>{profile.name}</h1>
              <p style={{ margin: 0 }}>
                USN: <strong>{profile.usn}</strong> · {profile.email}
              </p>
            </div>
          </div>
          <button className="btn ghost" onClick={() => setEditing((v) => !v)}>
            <Edit3 size={15} /> {editing ? "Cancel Editing" : "Edit Profile"}
          </button>
        </div>
      </div>

      {message && <div className="badge ok" style={{ width: "100%", padding: "0.6rem", marginBottom: "1rem" }}>{message}</div>}

      {editing ? (
        <div className="card">
          <h2>Update Profile Information</h2>
          <form className="form" onSubmit={onSubmit}>
            {error && <div className="error">{error}</div>}

            <div className="field">
              <label>Full Name</label>
              <input type="text" name="name" value={form.name} onChange={onChange} required />
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
              <input type="text" name="interests" value={form.interests} onChange={onChange} placeholder="e.g. AI, Fullstack, Cloud" />
            </div>

            <div className="field">
              <label>Profile Avatar URL (Optional Image Link)</label>
              <input type="url" name="photo_url" value={form.photo_url} onChange={onChange} placeholder="https://..." />
            </div>

            <button className="btn primary" type="submit" disabled={busy}>
              {busy ? "Saving updates…" : "Save Changes"}
            </button>
          </form>
        </div>
      ) : (
        <div className="grid grid-2">
          <div className="card">
            <h2>Academic Details</h2>
            <div className="list-item">
              <span className="muted" style={{ fontSize: "0.8rem" }}>Course / Degree</span>
              <p style={{ margin: "0.1rem 0", color: "var(--ink)", fontWeight: 600 }}>{profile.course}</p>
            </div>
            <div className="list-item">
              <span className="muted" style={{ fontSize: "0.8rem" }}>Department</span>
              <p style={{ margin: "0.1rem 0", color: "var(--ink)", fontWeight: 600 }}>{profile.department}</p>
            </div>
            <div className="list-item">
              <span className="muted" style={{ fontSize: "0.8rem" }}>Academic Standard</span>
              <p style={{ margin: "0.1rem 0", color: "var(--ink)", fontWeight: 600 }}>
                Year {profile.year} · Semester {profile.semester} · Section {profile.section}
              </p>
            </div>
          </div>

          <div className="card">
            <h2>Student Interests & Skills</h2>
            <p style={{ fontSize: "0.85rem" }}>
              Domains you are passionate about. These help customize peer recommendations and career opportunity matching.
            </p>
            <div className="chip-group" style={{ marginTop: "0.8rem" }}>
              {Array.isArray(profile.interests) && profile.interests.length > 0 ? (
                profile.interests.map((interest, idx) => (
                  <span key={idx} className="chip active">
                    <Sparkles size={12} /> {interest}
                  </span>
                ))
              ) : (
                <span className="muted">No interests added yet. Click Edit Profile to add.</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
