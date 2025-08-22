// src/pages/Companies.jsx
import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Companies() {
  const [list, setList] = useState([]);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [phone, setPhone] = useState("");

  async function load() {
    setList(await api.listCompanies());
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e) {
    e.preventDefault();
    if (!name.trim()) return alert("Name required");
    await api.createCompany({
      name,
      domain: domain || null,
      phone: phone || null,
    });
    setName("");
    setDomain("");
    setPhone("");
    await load();
  }

  async function del(id) {
    if (!confirm("Delete this company?")) return;
    await api.deleteCompany(id);
    setList((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div>
      <div className="hero" onMouseEnter={load} title="Hover to refresh">
        <div className="hero-title">Companies</div>
        <div className="hero-sub">Accounts you do business with.</div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">Create Company</div>
        <form className="card-body grid-2" onSubmit={add}>
          <div>
            <label>Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Corp"
            />
          </div>
          <div>
            <label>Domain</label>
            <input
              className="input"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="acme.com"
            />
          </div>
          <div>
            <label>Phone</label>
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9999999999"
            />
          </div>
          <div style={{ display: "flex", alignItems: "end", gap: 10 }}>
            <button className="btn btn-primary" type="submit">
              + Add
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                setName("");
                setDomain("");
                setPhone("");
              }}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">All Companies</div>
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Domain</th>
                <th>Phone</th>
                <th>Owner</th>
                <th>Created</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ color: "var(--muted)" }}>
                    No companies yet.
                  </td>
                </tr>
              )}
              {list.map((c) => (
                <tr key={c.id} className="row-grid">
                  <td>
                    <span className="badge">{c.id}</span>
                  </td>
                  <td>{c.name}</td>
                  <td>{c.domain || "—"}</td>
                  <td>{c.phone || "—"}</td>
                  <td>{c.owner_id || "—"}</td>
                  <td>
                    {c.created_at
                      ? new Date(c.created_at).toLocaleString()
                      : "—"}
                  </td>
                  <td className="row-actions" style={{ textAlign: "right" }}>
                    <button
                      className="btn btn-danger"
                      onClick={() => del(c.id)}
                    >
                      🗑 Delete
                    </button>
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
