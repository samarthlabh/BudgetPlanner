import React, { useState, useEffect } from "react";
import "./App.css";
import Auth from "./components/Auth";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  const [session, setSession] = useState(() => {
    return JSON.parse(localStorage.getItem("bp_session")) || null;
  });

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("bp_users")) || [];
    if (!users.some((u) => u.username === "admin")) {
      users.push({ username: "admin", password: "admin", role: "admin" });
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

  if (!session) {
    return <Auth onLoginSuccess={handleLogin} />;
  }

  return session.role === "admin" ? (
    <AdminDashboard session={session} onLogout={handleLogout} />
  ) : (
    <UserDashboard session={session} onLogout={handleLogout} />
  );
}