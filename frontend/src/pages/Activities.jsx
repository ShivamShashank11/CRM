// src/pages/Activities.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const TYPES = ["Note", "Call", "Email", "Meeting"];

export default function Activities() {
  const [list, setList] = useState([]);
  const [type, setType] = useState("Note");
  const [content, setContent] = useState("");
  const [dealId, setDealId] = useState("");
  const [contactId, setContactId] = useState("");
  const [dueAt, setDueAt] = useState("");

  const load = useCallback(async () => {
    setList(await api.listActivities());
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const sorted = useMemo(
    () =>
      [...list].sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      ),
    [list]
  );

  async function add(e) {
    e.preventDefault();
    if (!content.trim()) return alert("Content required");
    await api.createActivity({
      type,
      content: content.trim(),
      deal_id: dealId ? Number(dealId) : null,
      contact_id: contactId ? Number(contactId) : null,
      due_at: dueAt || null,
    });
    setType("Note");
    setContent("");
    setDealId("");
    setContactId("");
    setDueAt("");
    await load();
  }

  async function del(id) {
    if (!confirm("Delete this activity?")) return;
    await api.deleteActivity(id);
    setList((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div>
      <div className="hero" onMouseEnter={load} title="Hover to refresh">
        <div className="hero-title">Activities</div>
        <div className="hero-sub">Notes, calls, emails, meetings.</div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">Create Activity</div>
        <form className="card-body grid-2" onSubmit={add}>
          <div>
            <label>Type</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TYPES.map((t) => (
                <button
                  type="button"
                  key={t}
                  className={`btn ${type === t ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label>Deal ID (optional)</label>
              <input
                className="input"
                value={dealId}
                onChange={(e) => setDealId(e.target.value)}
                placeholder="1"
                inputMode="numeric"
              />
            </div>
            <div>
              <label>Contact ID (optional)</label>
              <input
                className="input"
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                placeholder="1"
                inputMode="numeric"
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label>Due (optional)</label>
              <input
                className="input"
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </div>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label>Content</label>
            <textarea
              className="textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a brief note…"
            />
          </div>
          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
            }}
          >
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                setType("Note");
                setContent("");
                setDealId("");
                setContactId("");
                setDueAt("");
              }}
            >
              Clear
            </button>
            <button className="btn btn-primary" type="submit">
              + Add Activity
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">Recent Activities</div>
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Content</th>
                <th>Deal</th>
                <th>Contact</th>
                <th>Owner</th>
                <th>Due</th>
                <th>Created</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ color: "var(--muted)" }}>
                    No activity yet.
                  </td>
                </tr>
              )}
              {sorted.map((a) => (
                <tr key={a.id} className="row-grid">
                  <td>
                    <span className="badge">{a.id}</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        a.type === "Meeting"
                          ? "badge-green"
                          : a.type === "Call"
                          ? "badge-blue"
                          : "badge-amber"
                      }`}
                    >
                      {a.type}
                    </span>
                  </td>
                  <td>{a.content}</td>
                  <td>{a.deal_id ?? "—"}</td>
                  <td>{a.contact_id ?? "—"}</td>
                  <td>{a.created_by ?? "—"}</td>
                  <td>
                    {a.due_at ? new Date(a.due_at).toLocaleString() : "—"}
                  </td>
                  <td>
                    {a.created_at
                      ? new Date(a.created_at).toLocaleString()
                      : "—"}
                  </td>
                  <td className="row-actions" style={{ textAlign: "right" }}>
                    <button
                      className="btn btn-danger"
                      onClick={() => del(a.id)}
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
