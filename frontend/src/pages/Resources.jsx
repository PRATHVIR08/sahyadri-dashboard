import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react";
import { BookOpen, Download, ExternalLink, FileText, Layers, Video, Youtube } from "lucide-react";
import { api } from "../api";

export default function Resources() {
  const { kind = "papers" } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const kinds = [
    { id: "papers", label: "VTU Question Papers", icon: FileText },
    { id: "materials", label: "Course Materials", icon: BookOpen },
    { id: "textbooks", label: "Reference Textbooks", icon: Layers },
    { id: "notes", label: "Faculty Notes", icon: FileText },
    { id: "handwritten", label: "Handwritten Notes", icon: FileText },
    { id: "youtube", label: "YouTube Playlists", icon: Youtube },
  ];

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        let endpoint = "/api/materials";
        if (kind === "papers") endpoint = "/api/papers";
        const res = await api(endpoint);
        setData(res);
      } catch (err) {
        setError(err.message || "Failed to load study resources");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [kind]);

  const filtered = data.filter(
    (item) =>
      (item.subject && item.subject.toLowerCase().includes(search.toLowerCase())) ||
      (item.title && item.title.toLowerCase().includes(search.toLowerCase())) ||
      (item.code && item.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fade-in">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <h1>Academic Resources & Study Vault</h1>
          <p style={{ margin: 0 }}>Previous year VTU papers, syllabus notes, lab manuals, and video references.</p>
        </div>
      </div>

      {/* Kind Tabs */}
      <div className="tabs" style={{ marginBottom: "1.25rem" }}>
        {kinds.map((k) => (
          <button
            key={k.id}
            className={`tab ${kind === k.id ? "active" : ""}`}
            onClick={() => navigate(`/resources/${k.id}`)}
          >
            <k.icon size={14} style={{ marginRight: "0.3rem" }} /> {k.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="search" style={{ maxWidth: "500px", marginBottom: "1.25rem" }}>
        <input
          type="text"
          placeholder="Search by subject name, course code, or topic…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="error" style={{ marginBottom: "1rem" }}>{error}</div>}

      {/* Content Rendering */}
      {kind === "papers" ? (
        <div className="card">
          <h2>Question Papers Repository</h2>
          {filtered.length === 0 ? (
            <div className="empty">No question papers matching search criteria.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Code</th>
                    <th>Exam Type</th>
                    <th>Year</th>
                    <th>Semester</th>
                    <th>Scheme</th>
                    <th>Download Link</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((paper) => (
                    <tr key={paper.id}>
                      <td>
                        <strong>{paper.subject}</strong>
                      </td>
                      <td>{paper.code}</td>
                      <td>
                        <span className="badge ok">{paper.exam_type}</span>
                      </td>
                      <td>{paper.year}</td>
                      <td>Sem {paper.semester}</td>
                      <td>{paper.scheme} Scheme</td>
                      <td>
                        <a
                          href={paper.file_url || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="btn small primary"
                          style={{ textDecoration: "none" }}
                        >
                          <Download size={13} style={{ marginRight: "0.2rem" }} /> Open / PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-2">
          {filtered.length === 0 ? (
            <div className="card empty" style={{ gridColumn: "span 2" }}>
              No study materials found for this section.
            </div>
          ) : (
            filtered.map((mat) => (
              <div key={mat.id} className="card">
                <div className="row" style={{ justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <span className="badge neutral">{mat.material_type || kind.toUpperCase()}</span>
                  <span className="badge ok">Sem {mat.semester}</span>
                </div>
                <h3>{mat.title || mat.subject}</h3>
                <p className="muted" style={{ fontSize: "0.82rem" }}>
                  Code: <strong>{mat.code}</strong> · Course Material
                </p>
                <div style={{ marginTop: "1rem" }}>
                  <a
                    href={mat.file_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="btn small primary"
                    style={{ textDecoration: "none" }}
                  >
                    <ExternalLink size={13} style={{ marginRight: "0.2rem" }} /> Access Material
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
