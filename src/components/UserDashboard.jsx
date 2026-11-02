import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const expCategories = ["Housing & Rent", "Groceries & Food", "Utilities", "Entertainment", "Transit"];
const incCategories = ["Salary", "Investments", "Freelance", "Other"];

export default function UserDashboard({ session, onLogout }) {
  const [records, setRecords] = useState(() => {
    return JSON.parse(localStorage.getItem(`bp_records_${session.username}`)) || [];
  });
  const [savingsGoal, setSavingsGoal] = useState(() => {
    return parseFloat(localStorage.getItem(`bp_goal_${session.username}`)) || 500;
  });

  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Expense");
  const [category, setCategory] = useState(expCategories[0]);
  const [goalInput, setGoalInput] = useState("");

  useEffect(() => {
    setCategory(type === "Expense" ? expCategories[0] : incCategories[0]);
  }, [type]);

  const saveRecords = (newRecords) => {
    setRecords(newRecords);
    localStorage.setItem(`bp_records_${session.username}`, JSON.stringify(newRecords));
  };

  const handleAddEntry = (e) => {
    e.preventDefault();
    const newRec = {
      id: Date.now(),
      desc: desc.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toISOString().split("T")[0]
    };
    saveRecords([newRec, ...records]);
    setDesc("");
    setAmount("");
  };

  const handleDelete = (id) => {
    saveRecords(records.filter((r) => r.id !== id));
  };

  const handleUpdateGoal = () => {
    const val = parseFloat(goalInput);
    if (!isNaN(val) && val > 0) {
      setSavingsGoal(val);
      localStorage.setItem(`bp_goal_${session.username}`, val.toString());
      setGoalInput("");
    }
  };

  const incTotal = records.filter((r) => r.type === "Income").reduce((s, r) => s + r.amount, 0);
  const expTotal = records.filter((r) => r.type === "Expense").reduce((s, r) => s + r.amount, 0);
  const balance = incTotal - expTotal;
  const goalPct = Math.min(Math.max((balance / savingsGoal) * 100, 0), 100);

  const chartData = {
    labels: expCategories,
    datasets: [
      {
        data: expCategories.map((cat) =>
          records.filter((r) => r.type === "Expense" && r.category === cat).reduce((s, r) => s + r.amount, 0)
        ),
        backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"],
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="container">
      <div className="nav-bar">
        <div className="user-tag">
          <span>Logged in as: <strong>{session.username}</strong></span>
          <span className="badge badge-user">User Module</span>
        </div>
        <button className="btn-danger" onClick={onLogout}>Sign Out</button>
      </div>

      <header>
        <h1>Personal Budget Dashboard</h1>
        <p style={{ color: "var(--text-muted)" }}>Log transactions, review categorical trends, and monitor savings</p>
      </header>

      <div className="grid-stats">
        <div className="card stat-card">
          <h3>Total Income</h3>
          <div className="val" style={{ color: "var(--primary)" }}>₹{incTotal.toFixed(2)}</div>
        </div>
        <div className="card stat-card">
          <h3>Total Expenses</h3>
          <div className="val" style={{ color: "var(--danger)" }}>₹{expTotal.toFixed(2)}</div>
        </div>
        <div className="card stat-card">
          <h3>Net Balance</h3>
          <div className="val">₹{balance.toFixed(2)}</div>
        </div>
        <div className="card stat-card">
          <h3>Savings Goal Progress</h3>
          <div className="val">₹{Math.max(0, balance).toFixed(0)} / ₹{savingsGoal.toFixed(0)}</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${goalPct}%` }}></div>
          </div>
        </div>
      </div>

      <div className="main-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="card">
            <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Add Entry</h2>
            <form onSubmit={handleAddEntry}>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="e.g., Salary, Rent, Groceries"
                  required
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {(type === "Expense" ? expCategories : incCategories).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary">Add Entry</button>
            </form>
          </div>

          <div className="card">
            <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Update Savings Goal</h2>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="number"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="Monthly Goal (₹)"
              />
              <button type="button" className="btn-outline" style={{ width: "auto" }} onClick={handleUpdateGoal}>
                Set
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="card">
            <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Expenditure Breakdown</h2>
            <div className="chart-box">
              <Doughnut
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 10 } } } }
                }}
              />
            </div>
          </div>

          <div className="card" style={{ flex: 1 }}>
            <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Recent Records</h2>
            <ul className="tx-list">
              {records.length === 0 ? (
                <li style={{ textAlign: "center", color: "var(--text-muted)", padding: "1rem" }}>
                  No entries logged.
                </li>
              ) : (
                records.map((r) => (
                  <li key={r.id} className="tx-item">
                    <div>
                      <span style={{ fontWeight: 600 }}>{r.desc}</span>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {r.category} &bull; {r.date}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color: r.type === "Income" ? "var(--primary)" : "var(--danger)"
                        }}
                      >
                        {r.type === "Income" ? "+" : "-"}₹{r.amount.toFixed(2)}
                      </span>
                      <button className="del-btn" onClick={() => handleDelete(r.id)}>&times;</button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}