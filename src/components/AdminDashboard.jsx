import React, { useState } from "react";

export default function AdminDashboard({ session, onLogout }) {
  const [users, setUsers] = useState(() => {
    return JSON.parse(localStorage.getItem("bp_users")) || [];
  });

  const handleDeleteUser = (targetUsername) => {
    if (!confirm(`Are you sure you want to delete user "${targetUsername}" and their records?`)) return;
    const updatedUsers = users.filter((u) => u.username !== targetUsername);
    setUsers(updatedUsers);
    localStorage.setItem("bp_users", JSON.stringify(updatedUsers));
    localStorage.removeItem(`bp_records_${targetUsername}`);
    localStorage.removeItem(`bp_goal_${targetUsername}`);
  };

  let totalTxCount = 0;
  let totalVolume = 0;

  const userStats = users.map((u) => {
    const userRecs = JSON.parse(localStorage.getItem(`bp_records_${u.username}`)) || [];
    totalTxCount += userRecs.length;

    const inc = userRecs.filter((r) => r.type === "Income").reduce((s, r) => s + r.amount, 0);
    const exp = userRecs.filter((r) => r.type === "Expense").reduce((s, r) => s + r.amount, 0);
    totalVolume += (inc + exp);
    const netBal = inc - exp;

    return { ...u, recordsCount: userRecs.length, netBal };
  });

  return (
    <div className="container">
      <div className="nav-bar">
        <div className="user-tag">
          <span>Logged in as: <strong>{session.username}</strong></span>
          <span className="badge badge-admin">Admin Module</span>
        </div>
        <button className="btn-danger" onClick={onLogout}>Sign Out</button>
      </div>

      <header>
        <h1 style={{ color: "var(--admin)" }}>System Administration Panel</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Monitor registered accounts, aggregate volume, and global platform state
        </p>
      </header>

      <div className="grid-stats">
        <div className="card stat-card">
          <h3>Total Registered Users</h3>
          <div className="val" style={{ color: "var(--admin)" }}>{users.length}</div>
        </div>
        <div className="card stat-card">
          <h3>System Total Transactions</h3>
          <div className="val">{totalTxCount}</div>
        </div>
        <div className="card stat-card">
          <h3>System Cash Flow Logged</h3>
          <div className="val" style={{ color: "var(--primary)" }}>₹{totalVolume.toFixed(2)}</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>User Directory & Data Management</h2>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Logged Records</th>
                <th>Net Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userStats.map((u) => (
                <tr key={u.username}>
                  <td><strong>{u.username}</strong></td>
                  <td>
                    <span className={`badge ${u.role === "admin" ? "badge-admin" : "badge-user"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.recordsCount}</td>
                  <td style={{ fontWeight: 600, color: u.netBal >= 0 ? "var(--primary)" : "var(--danger)" }}>
                    ₹{u.netBal.toFixed(2)}
                  </td>
                  <td>
                    {u.username === "admin" ? (
                      <em style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Protected</em>
                    ) : (
                      <button
                        className="btn-danger"
                        style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                        onClick={() => handleDeleteUser(u.username)}
                      >
                        Delete User
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}