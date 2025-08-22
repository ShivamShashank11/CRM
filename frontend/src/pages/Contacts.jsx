// src/pages/Contacts.jsx
import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Contacts() {
  const [list, setList] = useState([]);
  const [companyId, setCompanyId] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  async function load() {
    setList(await api.listContacts());
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e) {
    e.preventDefault();
    if (!first.trim()) return alert("First name required");
    await api.createContact({
      company_id: companyId ? Number(companyId) : null,
      first_name: first,
      last_name: last || null,
      email: email || null,
      phone: phone || null,
    });
    setCompanyId("");
    setFirst("");
    setLast("");
    setEmail("");
    setPhone("");
    await load();
  }

  async function del(id) {
    if (!confirm("Delete this contact?")) return;
    await api.deleteContact(id);
    setList((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div>
      <div className="hero" onMouseEnter={load} title="Hover to refresh">
        <div className="hero-title">Contacts</div>
        <div className="hero-sub">People at your accounts.</div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">Create Contact</div>
        <form className="card-body grid-2" onSubmit={add}>
          <div>
            <label>Company ID (optional)</label>
            <input
              className="input"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              placeholder="1"
              inputMode="numeric"
            />
          </div>
          <div>
            <label>First name</label>
            <input
              className="input"
              value={first}
              onChange={(e) => setFirst(e.target.value)}
              placeholder="John"
            />
          </div>
          <div>
            <label>Last name</label>
            <input
              className="input"
              value={last}
              onChange={(e) => setLast(e.target.value)}
              placeholder="Doe"
            />
          </div>
          <div>
            <label>Email</label>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@acme.com"
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
                setCompanyId("");
                setFirst("");
                setLast("");
                setEmail("");
                setPhone("");
              }}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">All Contacts</div>
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Company</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Owner</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ color: "var(--muted)" }}>
                    No contacts yet.
                  </td>
                </tr>
              )}
              {list.map((c) => (
                <tr key={c.id} className="row-grid">
                  <td>
                    <span className="badge">{c.id}</span>
                  </td>
                  <td>{c.company_id ?? "—"}</td>
                  <td>
                    {c.first_name} {c.last_name || ""}
                  </td>
                  <td>{c.email || "—"}</td>
                  <td>{c.phone || "—"}</td>
                  <td>{c.owner_id || "—"}</td>
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
