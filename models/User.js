const { getDb } = require("../config/db");

const toUser = (row) =>
  row
    ? {
        id: row.id,
        name: row.name,
        email: row.email,
        passwordHash: row.password_hash,
        createdAt: row.created_at
      }
    : null;

const createUser = async ({ name, email, passwordHash }) => {
  const db = getDb();
  const [result] = await db.query(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [name, email, passwordHash]
  );
  return { id: result.insertId, name, email };
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
