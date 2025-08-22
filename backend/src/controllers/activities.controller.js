import { pool } from "../config/db.js";

export async function listActivities(req,res){
  const [rows] = await pool.query("SELECT * FROM activities ORDER BY id DESC");
  res.json(rows);
}
export async function createActivity(req,res){
  const { deal_id, contact_id, type, content, due_at } = req.body;
  if(!content) return res.status(400).json({error:"content required"});
  const created_by = req.user?.id ?? null;
  const [r] = await pool.query(
    "INSERT INTO activities (deal_id, contact_id, type, content, due_at, created_by) VALUES (?,?,?,?,?,?)",
    [deal_id ?? null, contact_id ?? null, type ?? "Note", content, due_at ?? null, created_by]
  );
  const [rows] = await pool.query("SELECT * FROM activities WHERE id=?", [r.insertId]);
  res.status(201).json(rows[0]);
}
export async function getActivity(req,res){
  const id = Number(req.params.id);
  const [rows] = await pool.query("SELECT * FROM activities WHERE id=?", [id]);
  if(!rows.length) return res.status(404).json({error:"Not found"});
  res.json(rows[0]);
}
export async function updateActivity(req,res){
  const id = Number(req.params.id);
  const { deal_id, contact_id, type, content, due_at } = req.body;
  await pool.query(
    "UPDATE activities SET deal_id=?, contact_id=?, type=?, content=?, due_at=? WHERE id=?",
    [deal_id ?? null, contact_id ?? null, type ?? "Note", content, due_at ?? null, id]
  );
  const [rows] = await pool.query("SELECT * FROM activities WHERE id=?", [id]);
  res.json(rows[0]);
}
export async function deleteActivity(req,res){
  const id = Number(req.params.id);
  await pool.query("DELETE FROM activities WHERE id=?", [id]);
  res.json({deleted:true});
}
