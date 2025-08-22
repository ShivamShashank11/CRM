import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listCompanies, createCompany, getCompany, updateCompany, deleteCompany } from "../controllers/companies.controller.js";

const r = Router();
r.use(requireAuth);
r.get("/", listCompanies);
r.post("/", createCompany);
r.get("/:id", getCompany);
r.put("/:id", updateCompany);
r.delete("/:id", deleteCompany);
export default r;
