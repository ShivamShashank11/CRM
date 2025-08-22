// src/App.jsx
import { useEffect, useMemo, useState, createContext, useContext } from "react";
import {
  NavLink,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Companies from "./pages/Companies.jsx";
import Contacts from "./pages/Contacts.jsx";
import Deals from "./pages/Deals.jsx";
import Activities from "./pages/Activities.jsx";
import { api } from "./lib/api";

// ---------- Auth Context ----------
const AuthCtx = createContext(null);
function useAuth() {
  return useContext(AuthCtx);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null: unknown, false: not logged, object: logged
  const [loading, setLoading] = useState(true);

  // validate token on first load (and on tab refresh)
  useEffect(() => {
    async function check() {
      try {
        const me = await api.me();
        setUser(me.user || me); // backend returns { user: {...} }
      } catch {
        setUser(false);
      } finally {
        setLoading(false);
      }
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(false);
      setLoading(false);
    } else {
      check();
    }
  }, []);

  const value = useMemo(() => ({ user, setUser, loading }), [user, loading]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

// ---------- Protected Route ----------
function Protected({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "60vh" }}>
        <div className="spinner" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

// ---------- Nav (only when logged in) ----------
function Nav() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  if (!user) return null; // hide nav until logged-in

  function logout() {
    localStorage.removeItem("token");
    setUser(false);
    navigate("/login", { replace: true });
  }

  const link =
    "px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-sm font-medium";

  return (
    <nav className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex items-center gap-2">
        <div className="size-2 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse" />
        <div className="font-semibold tracking-tight">Mini CRM</div>
      </div>

      <div className="flex items-center gap-2">
        <NavLink to="/dashboard" className={link}>
          Dashboard
        </NavLink>
        <NavLink to="/companies" className={link}>
          Companies
        </NavLink>
        <NavLink to="/contacts" className={link}>
          Contacts
        </NavLink>
        <NavLink to="/deals" className={link}>
          Deals
        </NavLink>
        <NavLink to="/activities" className={link}>
          Activities
        </NavLink>

        <div className="h-6 w-px bg-zinc-200 mx-1" />
        <button
          onClick={logout}
          className="btn btn-ghost"
          title={`Sign out ${user?.name ? `(${user.name})` : ""}`}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

// ---------- App ----------
export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-surface via-background to-surface text-foreground">
        <Nav />
        <div className="max-w-6xl mx-auto p-6">
          <Routes>
            {/* public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* protected */}
            <Route
              path="/"
              element={
                <Protected>
                  <Navigate to="/dashboard" replace />
                </Protected>
              }
            />
            <Route
              path="/dashboard"
              element={
                <Protected>
                  <Dashboard />
                </Protected>
              }
            />
            <Route
              path="/companies"
              element={
                <Protected>
                  <Companies />
                </Protected>
              }
            />
            <Route
              path="/contacts"
              element={
                <Protected>
                  <Contacts />
                </Protected>
              }
            />
            <Route
              path="/deals"
              element={
                <Protected>
                  <Deals />
                </Protected>
              }
            />
            <Route
              path="/activities"
              element={
                <Protected>
                  <Activities />
                </Protected>
              }
            />

            {/* fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
}
