// src/server.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { testDB } from "./config/db.js";
import router from "./routes/index.js";

dotenv.config();

const app = express();
const BOOT_TIME = Date.now();

// ---------- Security & Performance ----------
app.set("trust proxy", 1);
app.set("etag", false);

// ---------- Middleware ----------
app.use(
  cors({
    origin: [
      "http://localhost:5173",                 // ✅ Local frontend (Vite dev server)
      "https://crm-frontend-8vo3.onrender.com" // ✅ Render frontend
    ],
    credentials: true, // allow cookies/authorization headers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Prevent caching of API responses
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// ---------- Root info ----------
app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "crm-backend",
    uptimeSec: Math.round(process.uptime()),
    since: new Date(BOOT_TIME).toISOString(),
  });
});

// ---------- Health check ----------
const healthHandler = async (_req, res) => {
  try {
    const dbOk = await testDB();
    if (!dbOk) {
      return res.status(500).json({
        ok: false,
        service: "crm-backend",
        db: "fail",
      });
    }
    res.status(200).json({
      ok: true,
      service: "crm-backend",
      db: "ok",
      uptimeSec: Math.round(process.uptime()),
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      service: "crm-backend",
      db: "error",
      error: err.message,
    });
  }
};

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

// ---------- API welcome ----------
app.get("/api", (req, res) => {
  res.json({
    ok: true,
    service: "crm-backend",
    message: "Welcome to CRM API",
    endpoints: [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/me",
      "/api/companies",
      "/api/contacts",
      "/api/deals",
      "/api/activities",
    ],
  });
});

// ---------- Mount routes ----------
app.use("/api", router);

// ---------- 404 fallback ----------
app.use((req, res) => {
  res.status(404).json({
    error: `API route not found: ${req.originalUrl}`,
  });
});

// ---------- Error handler ----------
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Server error",
  });
});

// ---------- Boot ----------
const PORT = process.env.PORT || 5000;
let server;

(async () => {
  try {
    const ok = await testDB();
    console.log(
      ok ? "✅ MySQL connection successful" : "⚠️ MySQL test query failed"
    );
  } catch (err) {
    console.error("❌ MySQL connection error:", err.message);
    process.exit(1);
  }

  server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})();

// ---------- Graceful shutdown ----------
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log("🛑 HTTP server closed.");
      process.exit(0);
    });
    setTimeout(() => {
      console.warn("Force exiting after timeout.");
      process.exit(1);
    }, 10_000).unref();
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

export default app;
