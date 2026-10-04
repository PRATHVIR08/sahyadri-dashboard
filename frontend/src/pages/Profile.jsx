import { useEffect, useState } from "react";
import { Edit3, Sparkles } from "lucide-react";
import { useAuth } from "../auth";

export default function Profile() {
  const { user, saveProfile, refresh } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    section: "A",
    semester: 6,
    year: 3,
    interests: "",
    avatar_url: "",
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || user.name || "",
        section: user.section || "A",
        semester: user.semester || 6,
        year: user.year || 3,
        interests: Array.isArray(user.interests) ? user.interests.join(", ") : user.interests || "",
        avatar_url: user.avatar_url || user.photo_url || "",
      });
    }
  }, [user]);

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
      await saveProfile({
        ...form,
        interests: typeof form.interests === "string"
          ? form.interests.split(",").map((s) => s.trim()).filter(Boolean)
          : form.interests,
      });
      await refresh();
      setEditing(false);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setBusy(false);
    }
  }

  if (!user) return <div className="empty">Loading student profile…</div>;

  const displayName = user.full_name || user.name || "Student";
  const avatarSrc = user.avatar_url || user.photo_url;

  return (
    <div className="fade-in" style={{ maxWidth: "840px" }}>
      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <div className="row" style={{ gap: "1.25rem" }}>
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={displayName}
                style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "3px solid var(--forest)" }}
              />
            ) : (
              <div
                className="avatar"
                style={{ width: "80px", height: "80px", fontSize: "1.8rem" }}
              >
                {displayName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <span className="badge neutral" style={{ marginBottom: "0.2rem" }}>
                {(user.role || "student").toUpperCase()} ACCOUNT
              </span>
              <h1>{displayName}</h1>
              <p style={{ margin: 0 }}>
                USN: <strong>{user.usn || "N/A"}</strong> · {user.email}
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
              <input type="text" name="full_name" value={form.full_name} onChange={onChange} required />
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
              <input type="url" name="avatar_url" value={form.avatar_url} onChange={onChange} placeholder="https://..." />
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
              <p style={{ margin: "0.1rem 0", color: "var(--ink)", fontWeight: 600 }}>{user.course || "B.E."}</p>
            </div>
            <div className="list-item">
              <span className="muted" style={{ fontSize: "0.8rem" }}>Department</span>
              <p style={{ margin: "0.1rem 0", color: "var(--ink)", fontWeight: 600 }}>{user.department || "Information Science & Engineering"}</p>
            </div>
            <div className="list-item">
              <span className="muted" style={{ fontSize: "0.8rem" }}>Academic Standard</span>
              <p style={{ margin: "0.1rem 0", color: "var(--ink)", fontWeight: 600 }}>
                Year {user.year || 1} · Semester {user.semester || 1} · Section {user.section || "A"}
              </p>
            </div>
          </div>

          <div className="card">
            <h2>Student Interests & Skills</h2>
            <p style={{ fontSize: "0.85rem" }}>
              Domains you are passionate about. These help customize peer recommendations and career opportunity matching.
            </p>
            <div className="chip-group" style={{ marginTop: "0.8rem" }}>
              {Array.isArray(user.interests) && user.interests.length > 0 ? (
                user.interests.map((interest, idx) => (
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
