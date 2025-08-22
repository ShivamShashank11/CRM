// src/controllers/auth.controller.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

const JWT_EXPIRES_IN = "7d";
const { JWT_SECRET } = process.env;

function ensureJwt() {
  if (!JWT_SECRET) {
    const msg = "JWT_SECRET is not set";
    console.error(msg);
    throw Object.assign(new Error(msg), { status: 500 });
  }
}

export async function register(req, res) {
  try {
    ensureJwt();
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, password required" });
    }

    // pre-check to give a friendly message (unique index still protects)
    const [exists] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (exists.length) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    // role has default 'USER' in schema; set explicitly to be clear
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'USER')",
      [name, email, password_hash]
    );

    const user = { id: result.insertId, name, email, role: "USER" };
    const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.status(201).json({ user, token });
  } catch (e) {
    // Handle MySQL duplicate key race gracefully
    if (e && e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already registered" });
    }
    console.error("register error:", e);
    const status = e.status || 500;
    return res.status(status).json({ error: "Server error" });
  }
}

export async function login(req, res) {
  try {
    ensureJwt();
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }

    const [rows] = await pool.query(
      "SELECT id, name, email, role, password_hash FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    if (!rows.length) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const row = rows[0];
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = { id: row.id, name: row.name, email: row.email, role: row.role };
    const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ user, token });
  } catch (e) {
    console.error("login error:", e);
    const status = e.status || 500;
    return res.status(status).json({ error: "Server error" });
  }
}
