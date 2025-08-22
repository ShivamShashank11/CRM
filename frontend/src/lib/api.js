// src/lib/api.js
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
const DEFAULT_TIMEOUT_MS = 15000; // 15s safety timeout

function jsonOrText(text) {
  try { return JSON.parse(text); } catch { return text; }
}

async function request(
  path,
  { method = "GET", body, auth = true, timeoutMs = DEFAULT_TIMEOUT_MS } = {}
) {
  const headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",

    // Strongly ask browser/CDN not to cache
    "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
    "Pragma": "no-cache",
  };

  const token = localStorage.getItem("token");
  if (auth && token) headers["Authorization"] = `Bearer ${token}`;

  // cache-busting query for GETs to avoid 304/stale data
  let url = `${API_BASE}${path}`;
  if (method.toUpperCase() === "GET") {
    const sep = url.includes("?") ? "&" : "?";
    url = `${url}${sep}_=${Date.now()}`;
  }

  // timeout guard
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",        // tell fetch not to use HTTP cache
      signal: ac.signal,
      credentials: "omit",      // no cookies needed (JWT in header)
    });
  } catch (e) {
    clearTimeout(t);
    // Network / timeout error
    if (e.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw new Error(e.message || "Network error");
  } finally {
    clearTimeout(t);
  }

  const text = await res.text();
  const data = jsonOrText(text);

  if (!res.ok) {
    const msg = typeof data === "string" ? data : (data?.error || res.statusText || "Request failed");

    // Handle auth expiry: clear and send to login
    if (res.status === 401 && auth) {
      try { localStorage.removeItem("token"); } catch {}
      if (location.pathname !== "/login") {
        // Use replace to avoid broken back button loop
        window.location.replace("/login");
      }
    }

    // 304 should never happen because of cache-busting, but just in case:
    if (res.status === 304) {
      throw new Error("Not modified (cached) — busting cache failed.");
    }

    console.error("API error", res.status, msg);
    throw new Error(msg);
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => request("/auth/register", { method: "POST", body, auth: false }),
  login:    (body) => request("/auth/login",    { method: "POST", body, auth: false }),
  me:       ()     => request("/auth/me"),

  // Companies
  listCompanies:  ()         => request("/companies"),
  createCompany:  (body)     => request("/companies", { method: "POST", body }),
  getCompany:     (id)       => request(`/companies/${id}`),
  updateCompany:  (id, body) => request(`/companies/${id}`, { method: "PUT", body }),
  deleteCompany:  (id)       => request(`/companies/${id}`, { method: "DELETE" }),

  // Contacts
  listContacts:   ()         => request("/contacts"),
  createContact:  (body)     => request("/contacts", { method: "POST", body }),
  updateContact:  (id, body) => request(`/contacts/${id}`, { method: "PUT", body }),
  deleteContact:  (id)       => request(`/contacts/${id}`, { method: "DELETE" }),

  // Deals
  listDeals:      ()         => request("/deals"),
  createDeal:     (body)     => request("/deals", { method: "POST", body }),
  updateDeal:     (id, body) => request(`/deals/${id}`, { method: "PUT", body }),
  deleteDeal:     (id)       => request(`/deals/${id}`, { method: "DELETE" }),

  // Activities
  listActivities: ()         => request("/activities"),
  createActivity: (body)     => request("/activities", { method: "POST", body }),
  updateActivity: (id, body) => request(`/activities/${id}`, { method: "PUT", body }),
  deleteActivity: (id)       => request(`/activities/${id}`, { method: "DELETE" }),
};
