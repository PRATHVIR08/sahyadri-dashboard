import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("prathvir.is.24@sahyadri.edu.in");
  const [password, setPassword] = useState("Sahyadri@123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <p className="badge neutral">Sahyadri College of Engineering & Management</p>
        <h1>Sign in to the student portal</h1>
        <p>Use your college email, such as name.is.24@sahyadri.edu.in</p>
        <form className="form" onSubmit={submit}>
          {error && <div className="error">{error}</div>}
          <div className="field">
            <label>College email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn primary" disabled={busy}>{busy ? "Signing in…" : "Enter portal"}</button>
        </form>
        <p>
          New student? <Link to="/register">Create an account</Link>
        </p>
        <p className="muted" style={{ fontSize: "0.8rem" }}>
          Demo student:  prathvir.is.24@sahyadri.edu.in / Sahyadri@123
          <br />
          Admin:  admin@sahyadri.edu.in / Admin@12345
        </p>
      </div>
    </div>
  );
}
