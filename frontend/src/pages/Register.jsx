// src/pages/Register.jsx
import { useState } from "react";
import { api } from "../lib/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.register({ name, email, password });
      // Register successful -> go to login page
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="ring" />
        <header className="auth-head">
          <div className="logo-dot" />
          <div>
            <div className="auth-title">Create account</div>
            <div className="auth-sub">Join Mini CRM in seconds</div>
          </div>
        </header>

        {error && <div className="chip chip-error">⚠️ {error}</div>}

        <form className="auth-form" onSubmit={submit} noValidate>
          {/* Name */}
          <div className="field">
            <input
              className="input floating"
              placeholder=" "
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
            <label>Full name</label>
          </div>

          {/* Email */}
          <div className="field">
            <input
              className="input floating"
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <label>Email</label>
          </div>

          {/* Password */}
          <div className="field">
            <input
              className="input floating"
              type={show ? "text" : "password"}
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <label>Password</label>
            <button
              type="button"
              className="eye"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? "🙈" : "👁️"}
            </button>
          </div>

          <button
            className="btn btn-primary w100"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating…" : "Create account"}
          </button>

          <div className="muted center">
            Already have an account?{" "}
            <a className="link" href="/login">
              Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
