import React, { useState } from "react";

export default function Auth({ onLoginSuccess }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [jobProfile, setJobProfile] = useState("");
  const [feedback, setFeedback] = useState("");
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
      const newUser = {
        username: u,
        password: p,
        role: "user",
        fullName: fullName.trim(),
        age: age.trim(),
        jobProfile: jobProfile.trim(),
        feedback: feedback.trim(),
        lastLogin: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
      };
      users.push(newUser);
      localStorage.setItem("bp_users", JSON.stringify(users));
      onLoginSuccess(newUser);
    } else {
      const userIndex = users.findIndex((x) => x.username === u && x.password === p);
      const found = users[userIndex];
      if (!found) {
        setError("Invalid username or password.");
        return;
      }
      users[userIndex].lastLogin = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
      localStorage.setItem("bp_users", JSON.stringify(users));
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
          {mode === "signup" && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" required />
              </div>
              <div className="profile-row">
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" value={age} onChange={(e) => setAge(e.target.value)} min="10" max="120" placeholder="20" required />
                </div>
                <div className="form-group">
                  <label>Job Profile / Role</label>
                  <input type="text" value={jobProfile} onChange={(e) => setJobProfile(e.target.value)} placeholder="Student / Occupation" required />
                </div>
              </div>
              <div className="form-group">
                <label>Note for Admin (Optional)</label>
                <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Write a note for admin..." />
              </div>
            </>
          )}
          <button type="submit" className="btn-primary">
            {mode === "login" ? "Log In" : "Create Account"}
          </button>
          {error && <div className="error-msg">{error}</div>}
        </form>
      </div>
    </div>
  );
}