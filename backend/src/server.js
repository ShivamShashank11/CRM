// src/server.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { testDB } from "./config/db.js";
import router from "./routes/index.js";

dotenv.config();

const app = express();

// App hardening & perf
app.set("trust proxy", 1);
app.set("etag", false);

// Middleware
app.use(
  cors({
    origin: true,          // reflect request origin
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
// Prevent browser/proxy caching for API responses
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Root + health
app.get("/", (req, res) => {
  res.json({ ok: true, service: "crm-backend", uptime: process.uptime() });
});
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "crm-backend" });
});

// Mount feature routes
app.use("/api", router); // -> /api/auth, /api/companies, /api/contacts, /api/deals, /api/activities

// 404 (after all routes)
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Centralized error handler
// (if any controller calls next(err), it lands here)
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Server error",
  });
});

const PORT = process.env.PORT || 5000;

// Boot
(async () => {
  try {
    const ok = await testDB();
    console.log(ok ? "✅ MySQL connection successful" : "⚠️ MySQL test query failed");
  } catch (err) {
    console.error("❌ MySQL connection error:", err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})();

export default app;
