import { pool } from "../config/db.js";

export async function listCompanies(req, res){ 
  const [rows] = await pool.query("SELECT * FROM companies ORDER BY id DESC");
  res.json(rows);
}
export async function createCompany(req, res){
  const { name, domain, phone } = req.body;
  if(!name) return res.status(400).json({error:"name required"});
  const owner_id = req.user?.id ?? null;
  const [r] = await pool.query(
    "INSERT INTO companies (name, domain, phone, owner_id) VALUES (?,?,?,?)",
    [name, domain ?? null, phone ?? null, owner_id]
  );
  const [rows] = await pool.query("SELECT * FROM companies WHERE id=?", [r.insertId]);
  res.status(201).json(rows[0]);
}
export async function getCompany(req,res){
  const id = Number(req.params.id);
  const [rows] = await pool.query("SELECT * FROM companies WHERE id=?", [id]);
  if(!rows.length) return res.status(404).json({error:"Not found"});
  res.json(rows[0]);
}
export async function updateCompany(req,res){
  const id = Number(req.params.id);
  const { name, domain, phone } = req.body;
  await pool.query("UPDATE companies SET name=?, domain=?, phone=? WHERE id=?",
    [name, domain ?? null, phone ?? null, id]);
  const [rows] = await pool.query("SELECT * FROM companies WHERE id=?", [id]);
  res.json(rows[0]);
}
export async function deleteCompany(req,res){
  const id = Number(req.params.id);
  await pool.query("DELETE FROM companies WHERE id=?", [id]);
  res.json({deleted:true});
}
