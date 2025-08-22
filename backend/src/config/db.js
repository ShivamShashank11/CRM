// src/config/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const {
  DB_HOST, DB_PORT = 3306, DB_USER, DB_PASSWORD, DB_NAME, MYSQL_SSL
} = process.env;

export const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  ...(MYSQL_SSL === "true" ? { ssl: { rejectUnauthorized: false } } : {})
});

export async function testDB() {
  const [rows] = await pool.query("SELECT 1 AS ok");
  return rows?.[0]?.ok === 1;
}
