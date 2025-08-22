import { pool } from "../config/db.js";

export async function listDeals(req,res){
  const [rows] = await pool.query("SELECT * FROM deals ORDER BY id DESC");
  res.json(rows);
}
export async function createDeal(req,res){
  const { company_id, contact_id, title, amount, stage, close_date } = req.body;
  if(!title) return res.status(400).json({error:"title required"});
  const owner_id = req.user?.id ?? null;
  const [r] = await pool.query(
    "INSERT INTO deals (company_id, contact_id, title, amount, stage, owner_id, close_date) VALUES (?,?,?,?,?,?,?)",
    [company_id ?? null, contact_id ?? null, title, amount ?? 0, stage ?? "New", owner_id, close_date ?? null]
  );
  const [rows] = await pool.query("SELECT * FROM deals WHERE id=?", [r.insertId]);
  res.status(201).json(rows[0]);
}
export async function getDeal(req,res){
  const id = Number(req.params.id);
  const [rows] = await pool.query("SELECT * FROM deals WHERE id=?", [id]);
  if(!rows.length) return res.status(404).json({error:"Not found"});
  res.json(rows[0]);
}
export async function updateDeal(req,res){
  const id = Number(req.params.id);
  const { company_id, contact_id, title, amount, stage, close_date } = req.body;
  await pool.query(
    "UPDATE deals SET company_id=?, contact_id=?, title=?, amount=?, stage=?, close_date=? WHERE id=?",
    [company_id ?? null, contact_id ?? null, title, amount ?? 0, stage ?? "New", close_date ?? null, id]
  );
  const [rows] = await pool.query("SELECT * FROM deals WHERE id=?", [id]);
  res.json(rows[0]);
}
export async function deleteDeal(req,res){
  const id = Number(req.params.id);
  await pool.query("DELETE FROM deals WHERE id=?", [id]);
  res.json({deleted:true});
}
