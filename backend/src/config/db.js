// src/config/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT || 3306),
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,        // <- must be set (crm_db)
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,             // <- important
  ...(process.env.MYSQL_SSL === "true" ? { ssl: { rejectUnauthorized: false } } : {}),
});

export async function testDB() {
  const [rows] = await pool.query("SELECT 1 AS ok");
  return rows?.[0]?.ok === 1;
}
