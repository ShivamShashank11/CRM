import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listContacts, createContact, getContact, updateContact, deleteContact } from "../controllers/contacts.controller.js";

const r = Router();
r.use(requireAuth);
r.get("/", listContacts);
r.post("/", createContact);
r.get("/:id", getContact);
r.put("/:id", updateContact);
r.delete("/:id", deleteContact);
export default r;
