const { getDb } = require("../config/db");

const toUser = (row) =>
  row
    ? {
        id: row.id,
        name: row.name,
        email: row.email,
        passwordHash: row.password_hash,
        isAdmin: Boolean(row.is_admin),
        createdAt: row.created_at
      }
    : null;

const createUser = async ({ name, email, passwordHash, isAdmin = false }) => {
  const db = getDb();
  const [result] = await db.query(
    "INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, ?)",
    [name, email, passwordHash, isAdmin ? 1 : 0]
  );
  return { id: result.insertId, name, email, isAdmin };
};

const findByEmail = async (email) => {
  const db = getDb();
  const [rows] = await db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  return toUser(rows[0]);
};

const findById = async (id) => {
  const db = getDb();
  const [rows] = await db.query("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return toUser(rows[0]);
};

module.exports = { createUser, findByEmail, findById };
