import { Router } from "express";
import authRoutes from "./auth.routes.js";
import companyRoutes from "./companies.routes.js";
import contactRoutes from "./contacts.routes.js";
import dealRoutes from "./deals.routes.js";
import activityRoutes from "./activities.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ ok: true, service: "crm-backend" });
});

router.post("/ping", (req, res) => {
  res.json({ ok: true, method: req.method, got: req.body ?? null });
});

router.use("/auth", authRoutes);
router.use("/companies", companyRoutes);
router.use("/contacts", contactRoutes);
router.use("/deals", dealRoutes);
router.use("/activities", activityRoutes);

export default router;
