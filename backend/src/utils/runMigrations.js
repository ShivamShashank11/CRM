// src/utils/runMigrations.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function splitSql(sql) {
  return sql
    .replace(/\r\n/g, "\n")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split(/;\s*(?:\n|$)/)
    .map(s => s.trim())
    .filter(s => s.length && !s.startsWith("--"));
}

async function run() {
  const {
    DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, MYSQL_SSL,
  } = process.env;

  if (!DB_NAME) {
    console.error("❌ DB_NAME env not set");
    process.exit(1);
  }

  // ⚠️ IMPORTANT: connect WITHOUT database to avoid ER_BAD_DB_ERROR
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT || 3306),
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
    ...(MYSQL_SSL === "true" ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  try {
    // 1) Ensure DB exists + select it
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    await conn.query(`USE \`${DB_NAME}\``);

    const [[dbRow]] = await conn.query("SELECT DATABASE() AS db");
    console.log("🔎 Using database:", dbRow?.db || "(none)");

    // 2) Load schema file
    const schemaPath = path.join(__dirname, "..", "models", "schema.sql");
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`schema.sql not found at ${schemaPath}`);
    }
    const sql = fs.readFileSync(schemaPath, "utf8");
    const statements = splitSql(sql);

    // 3) Execute statements
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await conn.query(stmt);
      } catch (e) {
        console.error(`❌ Statement #${i + 1} failed:\n${stmt}\nError:`, e.code || e.message);
        throw e;
      }
    }

    // 4) Show tables
    const [tables] = await conn.query("SHOW TABLES");
    console.log("✅ Migration applied: schema ready");
    console.log("🗂️ Tables now present:", tables);
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.code || err.message);
    process.exit(1);
  } finally {
    await conn.end().catch(() => {});
  }
}

run();
