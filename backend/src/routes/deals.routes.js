import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listDeals, createDeal, getDeal, updateDeal, deleteDeal } from "../controllers/deals.controller.js";

const r = Router();
r.use(requireAuth);
r.get("/", listDeals);
r.post("/", createDeal);
r.get("/:id", getDeal);
r.put("/:id", updateDeal);
r.delete("/:id", deleteDeal);
export default r;
