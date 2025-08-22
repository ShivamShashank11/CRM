// src/pages/Login.jsx
import { useState } from "react";
import { api } from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await api.login({ email, password });
      if (remember) localStorage.setItem("token", token);
      else sessionStorage.setItem("token", token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message || "Login failed");
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
            <div className="auth-title">Welcome back</div>
            <div className="auth-sub">Sign in to your Mini CRM</div>
          </div>
        </header>

        {error && <div className="chip chip-error">⚠️ {error}</div>}

        <form className="auth-form" onSubmit={submit} noValidate>
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
              autoComplete="current-password"
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

          <div className="form-row">
            <label className="check">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <a className="muted" href="#" onClick={(e) => e.preventDefault()}>
              Forgot password?
            </a>
          </div>

          <button
            className="btn btn-primary w100"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Login"}
          </button>

          <div className="muted center">
            No account?{" "}
            <a className="link" href="/register">
              Create one
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
