import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

const JWT_EXPIRES_IN = "7d";

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "name, email, password required" });

    const [exists] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (exists.length) return res.status(409).json({ error: "Email already registered" });

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?,?,?)",
      [name, email, password_hash]
    );

    const user = { id: result.insertId, name, email, role: "USER" };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.status(201).json({ user, token });
  } catch (e) {
    console.error("register error:", e);
    res.status(500).json({ error: "Server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    const [rows] = await pool.query(
      "SELECT id, name, email, role, password_hash FROM users WHERE email = ?",
      [email]
    );
    if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });

    const userRow = rows[0];
    const ok = await bcrypt.compare(password, userRow.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const user = { id: userRow.id, name: userRow.name, email: userRow.email, role: userRow.role };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ user, token });
  } catch (e) {
    console.error("login error:", e);
    res.status(500).json({ error: "Server error" });
  }
}
