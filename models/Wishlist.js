const { getDb } = require("../config/db");

const listForUser = async (userId) => {
  const db = getDb();
  const [rows] = await db.query(
    `SELECT p.*
     FROM wishlists w
     JOIN products p ON w.product_id = p.id
     WHERE w.user_id = ?
     ORDER BY w.created_at DESC`,
    [userId]
  );

  return rows.map((row) => ({
    _id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    category: row.category,
    images: Array.isArray(row.images) ? row.images : JSON.parse(row.images || "[]"),
    stock: row.stock,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
};

const isInWishlist = async (userId, productId) => {
  const db = getDb();
  const [rows] = await db.query(
    "SELECT 1 FROM wishlists WHERE user_id = ? AND product_id = ? LIMIT 1",
    [userId, productId]
  );
  return Boolean(rows.length);
};

const addToWishlist = async (userId, productId) => {
  const db = getDb();
  await db.query(
    "INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)",
    [userId, productId]
  );
  return true;
};

const removeFromWishlist = async (userId, productId) => {
  const db = getDb();
  await db.query("DELETE FROM wishlists WHERE user_id = ? AND product_id = ?", [userId, productId]);
  return true;
};

module.exports = { listForUser, isInWishlist, addToWishlist, removeFromWishlist };
