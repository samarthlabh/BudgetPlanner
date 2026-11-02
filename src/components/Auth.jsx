import React, { useState } from "react";

export default function Auth({ onLoginSuccess }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const u = username.trim().toLowerCase();
    const p = password.trim();
    const users = JSON.parse(localStorage.getItem("bp_users")) || [];

    if (mode === "signup") {
      if (u === "admin" || users.find((x) => x.username === u)) {
        setError("Username already exists. Choose another.");
        return;
      }
      const newUser = { username: u, password: p, role: "user" };
      users.push(newUser);
      localStorage.setItem("bp_users", JSON.stringify(users));
      onLoginSuccess(newUser);
    } else {
      const found = users.find((x) => x.username === u && x.password === p);
      if (!found) {
        setError("Invalid username or password.");
        return;
      }
      onLoginSuccess(found);
    }
  };

  return (
    <div className="auth-container">
      <header>
        <h1>Budget Planner</h1>
        <p style={{ color: "var(--text-muted)" }}>Sign in to your account</p>
      </header>

      <div className="card">
        <div className="auth-tabs">
          <div
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => { setMode("login"); setError(""); }}
          >
            Login
          </div>
          <div
            className={`auth-tab ${mode === "signup" ? "active" : ""}`}
            onClick={() => { setMode("signup"); setError(""); }}
          >
            Sign Up
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            {mode === "login" ? "Log In" : "Create Account"}
          </button>
          {error && <div className="error-msg">{error}</div>}
        </form>
      </div>
    </div>
  );
}