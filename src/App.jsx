import React, { useState, useEffect } from "react";
import "./App.css";
import Auth from "./components/Auth";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  const [session, setSession] = useState(() => {
    return JSON.parse(localStorage.getItem("bp_session")) || null;
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("bp_theme") || "light";
  });

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("bp_users")) || [];
    if (!users.some((u) => u.username === "admin")) {
      users.push({
        username: "admin",
        password: "admin",
        role: "admin",
        fullName: "System Administrator",
        age: "N/A",
        jobProfile: "Platform Admin",
        feedback: "Root administrative account.",
        lastLogin: "Never"
      });
      localStorage.setItem("bp_users", JSON.stringify(users));
    }
  }, []);

  const handleLogin = (user) => {
    const activeData = { username: user.username, role: user.role };
    setSession(activeData);
    localStorage.setItem("bp_session", JSON.stringify(activeData));
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem("bp_session");
  };

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "light" ? "dark" : "light";
      localStorage.setItem("bp_theme", nextTheme);
      return nextTheme;
    });
  };

  const content = !session
    ? <Auth onLoginSuccess={handleLogin} />
    : session.role === "admin"
      ? <AdminDashboard session={session} onLogout={handleLogout} />
      : <UserDashboard session={session} onLogout={handleLogout} />;

  return (
    <div className={`app-shell ${theme}`}>
      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        <span aria-hidden="true">{theme === "light" ? "🌙" : "☀️"}</span>
        <span>{theme === "light" ? "Dark" : "Light"}</span>
      </button>
      {content}
    </div>
  );
}