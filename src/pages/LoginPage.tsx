import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";
import { getApiErrorInfo } from "../api/errorHandling";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const from = (location.state as { from?: string } | null)?.from ?? "/";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ username: username.trim(), password });
      navigate(from, { replace: true });
    } catch (requestError) {
      const info = getApiErrorInfo(requestError);
      setError(info.status === 401 ? "The username or password is incorrect, or the account is inactive. Check your login username or contact your school administrator." : info.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <div className="auth-brand"><div className="brand-mark">E</div><div><strong>EduSphere AI</strong><span>School Management System</span></div></div>
        <p className="eyebrow">Secure administration portal</p>
        <h1 id="login-title">Welcome back</h1>
        <p className="auth-copy">Sign in to manage students, academics, attendance, finance and AI-assisted operations.</p>
        <form onSubmit={handleSubmit}>
          <label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" placeholder="Enter username" required /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Enter password" required /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="primary-button auth-submit" disabled={submitting}>{submitting ? "Signing in..." : "Sign in"}</button>
        </form>
        <div className="auth-note"><strong>Need a new login account?</strong><p>Ask your school administrator to create it. Administrators can sign in and use School Setup → Create login account.</p><p>Starting a school for the first time? Sign in with the existing setup administrator account, then open School Setup.</p></div>
      </section>
      <aside className="auth-visual" aria-hidden="true"><div><p className="eyebrow">EduSphere AI</p><h2>One workspace for the entire school.</h2><p>Secure, role-aware school operations with intelligent assistance built in.</p></div></aside>
    </main>
  );
}
