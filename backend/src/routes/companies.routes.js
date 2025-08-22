// src/routes/companies.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listCompanies,
  createCompany,
  getCompany,
  updateCompany,
  deleteCompany,
} from "../controllers/companies.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", listCompanies);
router.post("/", createCompany);
router.get("/:id", getCompany);
router.put("/:id", updateCompany);
router.delete("/:id", deleteCompany);

export default router;
