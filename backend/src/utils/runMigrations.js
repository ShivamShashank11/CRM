import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  try {
    const sqlPath = path.resolve(__dirname, "../models/schema.sql");
    let sql = await fs.readFile(sqlPath, "utf8");
    // strip BOM if present
    sql = sql.replace(/^\uFEFF/, "");
    await pool.query(sql);
    console.log("✅ Migration applied: users table ready");
    process.exit(0);
  } catch (e) {
    console.error("❌ Migration failed:", e.message);
    process.exit(1);
  }
}
run();
