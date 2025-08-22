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
  return sql
    .replace(/\r\n/g, "\n")
    .replace(/\/\*[\s\S]*?\*\//g, "")   // remove /* */ comments
    .split(/;\s*(?:\n|$)/)              // split on semicolon end
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

    const [[dbRow]] = await pool.query("SELECT DATABASE() AS db");
    console.log("🔎 Using database:", dbRow?.db || "(none)");

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await pool.query(stmt);
      } catch (e) {
        console.error(`❌ Statement #${i + 1} failed:\n${stmt}\nError:`, e.code || e.message);
        throw e;
      }
    }

    const [tables] = await pool.query("SHOW TABLES");
    console.log("✅ Migration applied: schema ready");
    console.log("🗂️ Tables now present:", tables);

    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.code || err.message);
    process.exit(1);
  }
}

run();
