import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await resetPassword(password);
      setMessage("Your password has been reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card fade-in">
        <p className="badge neutral">Sahyadri Student Portal</p>
        <h1>Set New Password</h1>
        <p>Choose a secure password for your portal account.</p>

        {message ? (
          <div className="badge ok" style={{ width: "100%", padding: "0.8rem", margin: "1rem 0", display: "block" }}>
            {message}
          </div>
        ) : (
          <form className="form" onSubmit={submit}>
            {error && <div className="error">{error}</div>}
            <div className="field">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn primary" disabled={busy}>
              {busy ? "Updating password…" : "Update Password"}
            </button>
          </form>
        )}

        <p style={{ marginTop: "1rem" }}>
          Back to <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
