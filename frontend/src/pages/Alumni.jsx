import { useEffect, useState } from "react";
import { Briefcase, ExternalLink, GraduationCap, HelpCircle, Linkedin, MessageSquare, Send } from "lucide-react";
import { api } from "../api";

export default function Alumni() {
  const [alumniList, setAlumniList] = useState([]);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [questionText, setQuestionText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    try {
      const data = await api("/api/alumni");
      setAlumniList(data);
    } catch (err) {
      setError(err.message || "Failed to load alumni directory");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAskQuestion(e) {
    e.preventDefault();
    if (!selectedAlumni || !questionText.trim()) return;
    setSubmitting(true);
    setMsg("");
    setError("");
    try {
      await api("/api/alumni/questions", {
        method: "POST",
        body: JSON.stringify({
          alumni_id: selectedAlumni.id,
          question_text: questionText,
        }),
      });
      setMsg(`Question submitted to ${selectedAlumni.name}!`);
      setQuestionText("");
      setSelectedAlumni(null);
      load();
    } catch (err) {
      setError(err.message || "Failed to submit question.");
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = alumniList.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.company.toLowerCase().includes(search.toLowerCase()) ||
      a.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <h1>Sahyadri Alumni Network & Mentorship</h1>
          <p style={{ margin: 0 }}>Connect with proud Sahyadri graduates working across global companies.</p>
        </div>
      </div>

      {msg && <div className="badge ok" style={{ width: "100%", padding: "0.6rem", marginBottom: "1rem" }}>{msg}</div>}
      {error && <div className="error" style={{ marginBottom: "1rem" }}>{error}</div>}

      {/* Search Bar */}
      <div className="search" style={{ maxWidth: "500px", marginBottom: "1.25rem" }}>
        <input
          type="text"
          placeholder="Search by alumni name, company (Google, Microsoft), or department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Alumni Directory Grid */}
      <div className="grid grid-3">
        {filtered.map((alumni) => (
          <div key={alumni.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span className="badge neutral">
                  <GraduationCap size={12} /> Class of {alumni.passout_year}
                </span>
                <span className="badge ok">{alumni.department}</span>
              </div>

              <h2>{alumni.name}</h2>
              <p style={{ margin: "0.2rem 0", color: "var(--forest)", fontWeight: 600 }}>
                {alumni.designation} @ {alumni.company}
              </p>

              {/* Display existing Q&A if any */}
              {alumni.questions && alumni.questions.length > 0 && (
                <div className="card" style={{ background: "#f8f5ee", marginTop: "0.8rem", padding: "0.6rem" }}>
                  <span className="muted" style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>Q&A Thread</span>
                  {alumni.questions.map((q) => (
                    <div key={q.id} style={{ marginTop: "0.4rem", fontSize: "0.8rem" }}>
                      <p style={{ margin: 0, fontWeight: 600 }}>Q: {q.question_text}</p>
                      {q.answer_text ? (
                        <p style={{ margin: "0.2rem 0 0", color: "var(--ok)" }}>A: {q.answer_text}</p>
                      ) : (
                        <span className="muted" style={{ fontSize: "0.72rem" }}>Awaiting answer…</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="row" style={{ marginTop: "1rem", gap: "0.4rem" }}>
              {alumni.linkedin_url && (
                <a
                  href={alumni.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn small ghost"
                  style={{ textDecoration: "none" }}
                >
                  <Linkedin size={13} style={{ marginRight: "0.2rem" }} /> LinkedIn
                </a>
              )}
              <button className="btn small primary" onClick={() => setSelectedAlumni(alumni)}>
                <MessageSquare size={13} style={{ marginRight: "0.2rem" }} /> Ask Question
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Ask Question Modal */}
      {selectedAlumni && (
        <div className="modal-backdrop" onClick={() => setSelectedAlumni(null)}>
          <div className="modal-card fade-in" onClick={(e) => e.stopPropagation()}>
            <h2>Ask {selectedAlumni.name} a Career / Technical Question</h2>
            <p className="muted" style={{ fontSize: "0.85rem" }}>
              Working as <strong>{selectedAlumni.designation}</strong> at <strong>{selectedAlumni.company}</strong>.
            </p>

            <form className="form" onSubmit={handleAskQuestion} style={{ marginTop: "1rem" }}>
              <div className="field">
                <label>Your Question or Guidance Request</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Hi, how should I prepare for interview rounds at your company? Any advice for 3rd year ISE students?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                ></textarea>
              </div>

              <div className="row" style={{ justifyContent: "flex-end" }}>
                <button type="button" className="btn ghost" onClick={() => setSelectedAlumni(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn primary" disabled={submitting}>
                  <Send size={14} style={{ marginRight: "0.2rem" }} /> {submitting ? "Sending…" : "Submit Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
