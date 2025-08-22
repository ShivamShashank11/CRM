// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Dashboard() {
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);

  async function load() {
    const [c1, c2, c3, c4] = await Promise.all([
      api.listCompanies(),
      api.listContacts(),
      api.listDeals(),
      api.listActivities(),
    ]);
    setCompanies(Array.isArray(c1) ? c1 : []);
    setContacts(Array.isArray(c2) ? c2 : []);
    setDeals(Array.isArray(c3) ? c3 : []);
    setActivities(Array.isArray(c4) ? c4 : []);
  }
  useEffect(() => {
    load();
  }, []);

  const won = deals.filter((d) => d.stage === "Won").length;
  const pipeline = deals.reduce((s, d) => s + Number(d.amount || 0), 0);

  return (
    <div className="space-y">
      <div className="hero" onMouseEnter={load} title="Hover to refresh">
        <div className="hero-title">Dashboard</div>
        <div className="hero-sub">
          Unified view of your CRM — hover to refresh.
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header">Overview</div>
          <div
            className="card-body"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: 14,
            }}
          >
            <KPI label="Companies" value={companies.length} />
            <KPI label="Contacts" value={contacts.length} />
            <KPI label="Deals" value={deals.length} />
            <KPI label="Won Deals" value={won} />
            <KPI
              label="Pipeline (₹)"
              value={pipeline.toLocaleString()}
              accent="ok"
            />
            <button className="btn btn-primary" onClick={load}>
              🔄 Refresh
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Recent Activity</div>
          <div className="card-body">
            {activities.slice(0, 6).map((a) => (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span className="badge badge-amber">{a.type}</span>
                <span style={{ opacity: 0.9 }}>{a.content}</span>
                <span style={{ color: "var(--muted)" }}>
                  {a.created_at ? new Date(a.created_at).toLocaleString() : ""}
                </span>
              </div>
            ))}
            {activities.length === 0 && (
              <div style={{ color: "var(--muted)" }}>No activity yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, accent }) {
  const bg =
    accent === "ok"
      ? "linear-gradient(90deg,#10b98133,#10b98122)"
      : "linear-gradient(90deg,#f59e0b33,#f9731622)";
  return (
    <div
      className="card"
      style={{ background: bg, border: "1px solid var(--border)" }}
    >
      <div className="card-body">
        <div
          style={{
            fontSize: 12,
            color: "var(--muted)",
            textTransform: "uppercase",
            letterSpacing: ".6px",
          }}
        >
          {label}
        </div>
        <div style={{ fontWeight: 800, fontSize: 24 }}>{value}</div>
      </div>
    </div>
  );
}
