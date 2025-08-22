// src/utils/runMigrations.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { pool } from "../config/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function splitSql(sql) {
  // normalize newlines, drop /* */ block comments
  const cleaned = sql
    .replace(/\r\n/g, "\n")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  // split on semicolon that ends a statement (newline or EOF)
  return cleaned
    .split(/;\s*(?:\n|$)/)
    .map(s => s.trim())
    .filter(s => s.length && !s.startsWith("--"));
}

async function run() {
  try {
    const schemaPath = path.join(__dirname, "..", "models", "schema.sql");
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`schema.sql not found at ${schemaPath}`);
    }

    const sql = fs.readFileSync(schemaPath, "utf8");
    const statements = splitSql(sql);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      await pool.query(stmt);
    }

    console.log("✅ Migration applied: schema ready");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

run();
