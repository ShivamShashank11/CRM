import { pool } from "../config/db.js";

export async function listContacts(req,res){
  const [rows] = await pool.query(
    "SELECT * FROM contacts ORDER BY id DESC"
  );
  res.json(rows);
}
export async function createContact(req,res){
  const { company_id, first_name, last_name, email, phone } = req.body;
  if(!first_name) return res.status(400).json({error:"first_name required"});
  const owner_id = req.user?.id ?? null;
  const [r] = await pool.query(
    "INSERT INTO contacts (company_id, first_name, last_name, email, phone, owner_id) VALUES (?,?,?,?,?,?)",
    [company_id ?? null, first_name, last_name ?? null, email ?? null, phone ?? null, owner_id]
  );
  const [rows] = await pool.query("SELECT * FROM contacts WHERE id=?", [r.insertId]);
  res.status(201).json(rows[0]);
}
export async function getContact(req,res){
  const id = Number(req.params.id);
  const [rows] = await pool.query("SELECT * FROM contacts WHERE id=?", [id]);
  if(!rows.length) return res.status(404).json({error:"Not found"});
  res.json(rows[0]);
}
export async function updateContact(req,res){
  const id = Number(req.params.id);
  const { company_id, first_name, last_name, email, phone } = req.body;
  await pool.query(
    "UPDATE contacts SET company_id=?, first_name=?, last_name=?, email=?, phone=? WHERE id=?",
    [company_id ?? null, first_name, last_name ?? null, email ?? null, phone ?? null, id]
  );
  const [rows] = await pool.query("SELECT * FROM contacts WHERE id=?", [id]);
  res.json(rows[0]);
}
export async function deleteContact(req,res){
  const id = Number(req.params.id);
  await pool.query("DELETE FROM contacts WHERE id=?", [id]);
  res.json({deleted:true});
}
