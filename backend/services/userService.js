const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const supabase = require("../db");

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function requireResult(error) {
  if (error) throw new Error(error.message);
}

async function getUsers() {
  const { data, error } = await supabase.from("users").select("id, name, email").order("created_at", { ascending: false });
  requireResult(error);
  return data;
}

async function getUserById(id) {
  const { data, error } = await supabase.from("users").select("id, name, email").eq("id", id).maybeSingle();
  requireResult(error);
  return data;
}

async function findByEmail(email) {
  const { data, error } = await supabase.from("users").select('id, name, email, password_hash').eq("email", email).maybeSingle();
  requireResult(error);
  return data && { ...data, passwordHash: data.password_hash };
}

async function createUser({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, 12);
  const { data, error } = await supabase.from("users").insert({ id: crypto.randomUUID(), name, email, password_hash: passwordHash }).select("id, name, email, password_hash").single();
  requireResult(error);
  return { ...data, passwordHash: data.password_hash };
}

module.exports = { getUsers, getUserById, findByEmail, createUser, publicUser };
