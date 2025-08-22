// src/pages/Deals.jsx
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const STAGES = ["New", "Qualified", "Proposal", "Won", "Lost"];

// sanitize any amount string like "50,000" -> 50000
const cleanAmount = (v) => {
  const n = parseFloat(String(v).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export default function Deals() {
  const [list, setList] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);

  const [companyId, setCompanyId] = useState("");
  const [contactId, setContactId] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(""); // keep raw input as string
  const [stage, setStage] = useState("New");
  const [closeDate, setCloseDate] = useState("");
  const [loading, setLoading] = useState(false);

  // quick lookup maps for showing names instead of just IDs
  const companyNameById = useMemo(() => {
    const m = new Map();
    companies.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [companies]);

  const contactNameById = useMemo(() => {
    const m = new Map();
    contacts.forEach((c) =>
      m.set(c.id, `${c.first_name} ${c.last_name || ""}`.trim())
    );
    return m;
  }, [contacts]);

  async function loadDeals() {
    setList(await api.listDeals());
  }
  async function loadRefs() {
    const [co, ct] = await Promise.all([
      api.listCompanies(),
      api.listContacts(),
    ]);
    setCompanies(co);
    setContacts(ct);
  }

  useEffect(() => {
    (async () => {
      await Promise.all([loadRefs(), loadDeals()]);
    })();
  }, []);

  async function add(e) {
    e.preventDefault();
    if (!title.trim()) return alert("Title required");

    try {
      setLoading(true);
      const amt = amount === "" ? 0 : cleanAmount(amount);

      await api.createDeal({
        company_id: companyId ? Number(companyId) : null,
        contact_id: contactId ? Number(contactId) : null,
        title: title.trim(),
        amount: amt, // ✅ cleaned number so backend won't get null/NaN
        stage,
        close_date: closeDate || null,
      });

      // reset form
      setCompanyId("");
      setContactId("");
      setTitle("");
      setAmount("");
      setStage("New");
      setCloseDate("");

      // reload list
      await loadDeals();
    } catch (err) {
      alert(err.message || "Failed to create deal");
    } finally {
      setLoading(false);
    }
  }

  async function del(id) {
    if (!confirm("Delete this deal?")) return;
    await api.deleteDeal(id);
    setList((prev) => prev.filter((x) => x.id !== id)); // instant UI update
  }

  return (
    <div>
      {/* Header / hero */}
      <div className="hero">
        <div className="hero-title">Deals</div>
        <div className="hero-sub">Pipeline & opportunities.</div>
      </div>

      {/* Create form */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">Create Deal</div>
        <form className="card-body grid-2" onSubmit={add}>
          <div>
            <label>Company (optional)</label>
            <select
              className="select"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
            >
              <option value="">— Select company —</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.id} — {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Contact (optional)</label>
            <select
              className="select"
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
            >
              <option value="">— Select contact —</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.id} — {c.first_name} {c.last_name || ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Title</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Website revamp"
            />
          </div>

          <div>
            <label>Amount</label>
            <input
              className="input"
              type="number"
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50000"
            />
          </div>

          <div>
            <label>Stage</label>
            <select
              className="select"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Close date</label>
            <input
              className="input"
              type="date"
              value={closeDate}
              onChange={(e) => setCloseDate(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "end", gap: 10 }}>
            <button
              disabled={loading}
              className="btn btn-primary"
              type="submit"
            >
              {loading ? "Adding..." : "+ Add"}
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                setCompanyId("");
                setContactId("");
                setTitle("");
                setAmount("");
                setStage("New");
                setCloseDate("");
              }}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">All Deals</div>
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Company</th>
                <th>Contact</th>
                <th>Title</th>
                <th>Amount</th>
                <th>Stage</th>
                <th>Owner</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ color: "var(--muted)" }}>
                    No deals yet.
                  </td>
                </tr>
              )}
              {list.map((d) => (
                <tr key={d.id} className="row-grid">
                  <td>
                    <span className="badge">{d.id}</span>
                  </td>
                  <td title={`ID: ${d.company_id ?? "—"}`}>
                    {d.company_id
                      ? companyNameById.get(d.company_id) || `#${d.company_id}`
                      : "—"}
                  </td>
                  <td title={`ID: ${d.contact_id ?? "—"}`}>
                    {d.contact_id
                      ? contactNameById.get(d.contact_id) || `#${d.contact_id}`
                      : "—"}
                  </td>
                  <td>{d.title}</td>
                  <td>₹ {cleanAmount(d.amount).toLocaleString()}</td>
                  <td>
                    <span
                      className={`badge ${
                        d.stage === "Won"
                          ? "badge-green"
                          : d.stage === "Proposal"
                          ? "badge-amber"
                          : d.stage === "Lost"
                          ? "badge-red"
                          : ""
                      }`}
                    >
                      {d.stage}
                    </span>
                  </td>
                  <td>{d.owner_id ?? "—"}</td>
                  <td
                    className="row-actions"
                    style={{ textAlign: "right", whiteSpace: "nowrap" }}
                  >
                    <button
                      className="btn btn-danger"
                      onClick={() => del(d.id)}
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
