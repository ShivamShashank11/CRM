// src/lib/api.js

// ==== CONFIG ================================================================
// PRODUCTION: set in Render (Frontend -> Environment):
//   VITE_API_BASE=https://crm-6hgs.onrender.com
// LOCAL DEV: put in .env.local
//   VITE_API_BASE=http://localhost:5000
// NOTE: No /api prefix assumed. If your backend is mounted at /api,
// change local/prod envs to include /api (e.g. https://.../api).

const RAW_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const DEFAULT_TIMEOUT_MS = 15000; // 15s

// Normalize base: remove trailing slash
const API_BASE = RAW_BASE.replace(/\/+$/, "");

// Small helper: ensure we always join with a single slash
function joinUrl(base, path) {
  const p = String(path || "");
  const withSlash = p.startsWith("/") ? p : `/${p}`;
  return `${base}${withSlash}`;
}

function isJsonContentType(ct) {
  if (!ct) return false;
  return ct.toLowerCase().includes("application/json");
}

function jsonOrText(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Optional debug log (prints only in dev)
function dbg(...args) {
  if (import.meta.env.DEV) console.debug("[api]", ...args);
}

// ==== CORE REQUEST ==========================================================
async function request(
  path,
  { method = "GET", body, auth = true, timeoutMs = DEFAULT_TIMEOUT_MS } = {}
) {
  const urlBase = joinUrl(API_BASE, path);

  // Add cache-busting only for GET
  let url = urlBase;
  if (method.toUpperCase() === "GET") {
    const sep = url.includes("?") ? "&" : "?";
    url = `${url}${sep}_=${Date.now()}`;
  }

  const headers = {
    Accept: "application/json",
    // Only set Content-Type if we're sending a JSON body
    ...(body ? { "Content-Type": "application/json" } : {}),
    // Tell proxies/CDNs not to cache
    "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
    Pragma: "no-cache",
  };

  // Bearer token auth (no cookies)
  const token = (auth && (localStorage.getItem("token") || sessionStorage.getItem("token"))) || null;
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const ac = new AbortController();
  const timeoutId = setTimeout(() => ac.abort(), timeoutMs);

  dbg(method, url, { hasBody: !!body, auth });

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: ac.signal,
      credentials: "omit", // we use Authorization header, not cookies
    });
  } catch (e) {
    clearTimeout(timeoutId);
    if (e?.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    // Typical “Failed to fetch” / CORS / DNS / SSL errors end up here
    throw new Error(`Network/CORS error: ${e?.message || "Failed to fetch"}`);
  } finally {
    clearTimeout(timeoutId);
  }

  // Parse response
  const ct = res.headers.get("content-type") || "";
  const raw = await res.text();
  const data = isJsonContentType(ct) ? jsonOrText(raw) : raw;

  if (!res.ok) {
    // Prefer server-provided message if JSON, else statusText
    const serverMsg =
      typeof data === "string" ? data : data?.error || data?.message;
    const msg = serverMsg || res.statusText || "Request failed";

    // Handle expired/invalid auth
    if (res.status === 401 && auth) {
      try {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
      } catch {}
      if (location.pathname !== "/login") {
        // Avoid back-button loops
        window.location.replace("/login");
      }
    }

    // 304 should not occur due to cache-busting, but just in case
    if (res.status === 304) {
      throw new Error("Not modified (cached) — cache-busting failed.");
    }

    console.error("API error", res.status, msg);
    throw new Error(msg);
  }

  return data;
}

// ==== PUBLIC API ============================================================

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

  // Helpers (optional): manual token control
  setToken(token, remember = true) {
    try {
      if (remember) {
        localStorage.setItem("token", token);
        sessionStorage.removeItem("token");
      } else {
        sessionStorage.setItem("token", token);
        localStorage.removeItem("token");
      }
    } catch {}
  },
  clearToken() {
    try {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
    } catch {}
  },
};

export default api;
