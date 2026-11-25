import React, { useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { Doughnut, Bar, Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const expCategories = ["Housing & Rent", "Groceries & Food", "Utilities", "Entertainment", "Transit"];
const chartColors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function AdminDashboard({ session, onLogout }) {
  const [users, setUsers] = useState(() => {
    return JSON.parse(localStorage.getItem("bp_users")) || [];
  });
  const [inspectedUser, setInspectedUser] = useState(null);

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
  const globalCategoryTotals = Object.fromEntries(expCategories.map((category) => [category, 0]));
  const userLabels = [];
  const userTxCounts = [];

  const userStats = users.map((u) => {
    const userRecs = JSON.parse(localStorage.getItem(`bp_records_${u.username}`)) || [];
    totalTxCount += userRecs.length;

    const inc = userRecs.filter((r) => r.type === "Income").reduce((s, r) => s + r.amount, 0);
    const exp = userRecs.filter((r) => r.type === "Expense").reduce((s, r) => s + r.amount, 0);
    totalVolume += (inc + exp);
    const netBal = inc - exp;
    userRecs.filter((r) => r.type === "Expense").forEach((r) => {
      if (globalCategoryTotals[r.category] !== undefined) {
        globalCategoryTotals[r.category] += r.amount;
      }
    });
    if (u.role !== "admin") {
      userLabels.push(u.username);
      userTxCounts.push(userRecs.length);
    }

    return { ...u, recordsCount: userRecs.length, netBal };
  });

  const categoryChartData = {
    labels: expCategories,
    datasets: [{
      data: expCategories.map((category) => globalCategoryTotals[category]),
      backgroundColor: chartColors,
      borderWidth: 1
    }]
  };

  const activityChartData = {
    labels: userLabels.length ? userLabels : ["No Users"],
    datasets: [{
      label: "Transactions Logged",
      data: userTxCounts.length ? userTxCounts : [0],
      backgroundColor: "#6366f1",
      borderRadius: 4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 10 } } } }
  };

  const inspectedRecords = inspectedUser
    ? JSON.parse(localStorage.getItem(`bp_records_${inspectedUser.username}`)) || []
    : [];
  const inspectedExpenses = inspectedRecords.filter((r) => r.type === "Expense");
  const inspectedTotal = inspectedExpenses.reduce((sum, r) => sum + r.amount, 0);
  const categoryPercentages = expCategories.map((category) => {
    if (!inspectedTotal) return 0;
    const categoryTotal = inspectedExpenses
      .filter((r) => r.category === category)
      .reduce((sum, r) => sum + r.amount, 0);
    return Number(((categoryTotal / inspectedTotal) * 100).toFixed(1));
  });
  const modalChartData = {
    labels: expCategories.map((category, index) => `${category} (${categoryPercentages[index]}%)`),
    datasets: [{
      data: categoryPercentages,
      backgroundColor: chartColors,
      borderWidth: 1
    }]
  };

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

      <div className="main-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="card">
          <h2 style={{ fontSize: "1.05rem", marginBottom: "0.5rem" }}>Platform Spending by Category</h2>
          <div className="chart-box">
            <Doughnut data={categoryChartData} options={chartOptions} />
          </div>
        </div>
        <div className="card">
          <h2 style={{ fontSize: "1.05rem", marginBottom: "0.5rem" }}>User Activity (Transactions Logged per User)</h2>
          <div className="chart-box">
            <Bar
              data={activityChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>User Directory & Data Management</h2>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Job Profile</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Logged Records</th>
                <th>Net Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userStats.map((u) => (
                <tr key={u.username}>
                  <td><button className="user-link" type="button" onClick={() => setInspectedUser(u)}>{u.username}</button></td>
                  <td>{u.fullName || "-"}</td>
                  <td>{u.jobProfile || "-"}</td>
                  <td>
                    <span className={`badge ${u.role === "admin" ? "badge-admin" : "badge-user"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{u.lastLogin || "Never"}</td>
                  <td>{u.recordsCount}</td>
                  <td style={{ fontWeight: 600, color: u.netBal >= 0 ? "var(--primary)" : "var(--danger)" }}>
                    ₹{u.netBal.toFixed(2)}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                      <button className="btn-admin" type="button" onClick={() => setInspectedUser(u)}>Inspect Profile</button>
                      {u.username === "admin" ? (
                        <em style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Protected</em>
                      ) : (
                        <button
                          className="btn-danger"
                          style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                          onClick={() => handleDeleteUser(u.username)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {inspectedUser && (
        <div className="modal-overlay" onMouseDown={(e) => {
          if (e.target === e.currentTarget) setInspectedUser(null);
        }}>
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: "1.2rem", color: "var(--admin-dark)" }}>
                  {inspectedUser.fullName || inspectedUser.username} (@{inspectedUser.username})
                </h2>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>User Details &amp; Category Breakdown</p>
              </div>
              <button className="btn-outline" style={{ width: "auto", padding: "0.3rem 0.7rem" }} onClick={() => setInspectedUser(null)}>
                Close &times;
              </button>
            </div>

            <div className="profile-grid">
              <div><strong>Full Name:</strong> {inspectedUser.fullName || "Not provided"}</div>
              <div><strong>Username:</strong> {inspectedUser.username}</div>
              <div><strong>Age:</strong> {inspectedUser.age || "Not provided"}</div>
              <div><strong>Job Profile:</strong> {inspectedUser.jobProfile || "Not provided"}</div>
              <div style={{ gridColumn: "span 2" }}><strong>Last Login:</strong> {inspectedUser.lastLogin || "Never"}</div>
            </div>

            <div className="feedback-box">
              <strong style={{ display: "block", marginBottom: "0.25rem", color: "var(--admin-dark)" }}>User Note / Feedback to Admin:</strong>
              <p style={{ color: "var(--text)", fontStyle: "italic" }}>
                {inspectedUser.feedback ? `"${inspectedUser.feedback}"` : "No note or feedback left by this user."}
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>Spending by Category</h3>
              <div className="chart-box" style={{ height: "200px" }}>
                <Pie
                  data={modalChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "right", labels: { boxWidth: 10, font: { size: 10 } } }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}