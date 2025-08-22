// src/routes/index.js
import { Router } from "express";
import { pool } from "../config/db.js";

import authRoutes from "./auth.routes.js";
import companyRoutes from "./companies.routes.js";
import contactRoutes from "./contacts.routes.js";
import dealRoutes from "./deals.routes.js";
import activityRoutes from "./activities.routes.js";

const router = Router();

// Health & ping
router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "crm-backend" });
});

router.post("/ping", (req, res) => {
  res.json({ ok: true, method: req.method, got: req.body ?? null });
});

// 🔍 Debug route (safe to keep/ remove later)
// GET /api/_debug/tables
router.get("/_debug/tables", async (_req, res, next) => {
  try {
    const [tables] = await pool.query("SHOW TABLES");
    const [users] = await pool.query("DESCRIBE users");
    res.json({ tables, users });
  } catch (e) {
    next(e);
  }
});

// Feature routes
router.use("/auth", authRoutes);
router.use("/companies", companyRoutes);
router.use("/contacts", contactRoutes);
router.use("/deals", dealRoutes);
router.use("/activities", activityRoutes);

export default router;
