import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function Login() {
  const { login, resendConfirmationEmail } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isUnconfirmed, setIsUnconfirmed] = useState(false);
  const [resendStatus, setResendStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setIsUnconfirmed(false);
    setResendStatus("");

    if (!email.trim().toLowerCase().endsWith("@sahyadri.edu.in")) {
      setError("Please use an official college email ending with @sahyadri.edu.in");
      setBusy(false);
      return;
    }

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      if (err.code === "EMAIL_NOT_CONFIRMED" || err.message?.toLowerCase().includes("email not confirmed")) {
        setIsUnconfirmed(true);
        setError("Email not confirmed. Supabase requires email verification before signing in.");
      } else {
        setError(err.message || "Sign in failed. Please check your credentials.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setResendStatus("");
    try {
      await resendConfirmationEmail(email);
      setResendStatus("Confirmation email resent! Please check your inbox and spam folder.");
    } catch (err) {
      setResendStatus(`Failed to resend: ${err.message}`);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card fade-in">
        <p className="badge neutral">Sahyadri College of Engineering & Management</p>
        <h1>Sign in to the student portal</h1>
        <p>Use your official college email, e.g. student.is.24@sahyadri.edu.in</p>

        <form className="form" onSubmit={submit}>
          {error && <div className="error">{error}</div>}

          {isUnconfirmed && (
            <div
              style={{
                background: "rgba(234, 179, 8, 0.1)",
                border: "1px solid rgba(234, 179, 8, 0.3)",
                padding: "0.85rem",
                borderRadius: "8px",
                fontSize: "0.88rem",
                marginBottom: "1rem",
              }}
            >
              <p style={{ fontWeight: 600, color: "#eab308", marginBottom: "0.4rem" }}>
                ⚠️ Email Verification Required
              </p>
              <p style={{ marginBottom: "0.6rem", color: "#cbd5e1" }}>
                Supabase sent a confirmation link to <strong>{email}</strong>. Please check your inbox/spam folder and click the link.
              </p>
              <button
                type="button"
                className="btn secondary"
                onClick={handleResend}
                disabled={resending}
                style={{ fontSize: "0.82rem", padding: "0.4rem 0.8rem" }}
              >
                {resending ? "Sending link…" : "Resend Confirmation Link"}
              </button>
              {resendStatus && (
                <p style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#38bdf8" }}>
                  {resendStatus}
                </p>
              )}
            </div>
          )}

          <div className="field">
            <label>College email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student.is.24@sahyadri.edu.in"
              required
            />
          </div>
          <div className="field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label>Password</label>
              <Link to="/forgot-password" style={{ fontSize: "0.8rem" }}>
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button className="btn primary" disabled={busy}>
            {busy ? "Signing in…" : "Enter portal"}
          </button>
        </form>
        <p style={{ marginTop: "1rem" }}>
          New student? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
