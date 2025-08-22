import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listActivities, createActivity, getActivity, updateActivity, deleteActivity } from "../controllers/activities.controller.js";

const r = Router();
r.use(requireAuth);
r.get("/", listActivities);
r.post("/", createActivity);
r.get("/:id", getActivity);
r.put("/:id", updateActivity);
r.delete("/:id", deleteActivity);
export default r;
