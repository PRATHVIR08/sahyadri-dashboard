import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await forgotPassword(email);
      setMessage("Password reset instructions have been sent to your email address.");
    } catch (err) {
      setError(err.message || "Failed to request password reset.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card fade-in">
        <p className="badge neutral">Sahyadri Student Portal</p>
        <h1>Reset Your Password</h1>
        <p>Enter your official college email (@sahyadri.edu.in) to receive reset instructions.</p>
        
        {message ? (
          <div className="badge ok" style={{ width: "100%", padding: "0.8rem", margin: "1rem 0", display: "block" }}>
            {message}
          </div>
        ) : (
          <form className="form" onSubmit={submit}>
            {error && <div className="error">{error}</div>}
            <div className="field">
              <label>College email</label>
              <input
                type="email"
                placeholder="name.is.24@sahyadri.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button className="btn primary" disabled={busy}>
              {busy ? "Sending link…" : "Send Reset Email"}
            </button>
          </form>
        )}

        <p style={{ marginTop: "1rem" }}>
          Remembered your password? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
