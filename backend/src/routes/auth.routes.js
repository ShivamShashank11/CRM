import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.post("/register", register);  // POST /api/auth/register
router.post("/login", login);        // POST /api/auth/login
router.get("/me", requireAuth, (req, res) => res.json({ user: req.user })); // GET /api/auth/me
export default router;
