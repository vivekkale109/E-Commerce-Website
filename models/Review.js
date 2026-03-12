const { getDb } = require("../config/db");

const listForProduct = async (productId) => {
  const db = getDb();
  const [rows] = await db.query(
    `SELECT r.id, r.product_id, r.user_id, r.rating, r.comment, r.created_at, u.name as user_name
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.product_id = ?
     ORDER BY r.created_at DESC`,
    [productId]
  );
  return rows.map((row) => ({
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    rating: row.rating,
    comment: row.comment,
    userName: row.user_name,
    createdAt: row.created_at
  }));
};

const upsertReview = async ({ productId, userId, rating, comment }) => {
  const db = getDb();
  await db.query(
    `INSERT INTO reviews (product_id, user_id, rating, comment)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)`
    ,
    [productId, userId, rating, comment]
  );

  const [rows] = await db.query(
    `SELECT r.id, r.product_id, r.user_id, r.rating, r.comment, r.created_at, u.name as user_name
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.product_id = ? AND r.user_id = ?
     LIMIT 1`,
    [productId, userId]
  );
  return rows[0]
    ? {
        id: rows[0].id,
        productId: rows[0].product_id,
        userId: rows[0].user_id,
        rating: rows[0].rating,
        comment: rows[0].comment,
        userName: rows[0].user_name,
        createdAt: rows[0].created_at
      }
    : null;
};

const getAverageForProduct = async (productId) => {
  const db = getDb();
  const [rows] = await db.query(
    "SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM reviews WHERE product_id = ?",
    [productId]
  );
  return {
    average: rows[0].avg_rating ? Number(rows[0].avg_rating) : 0,
    total: Number(rows[0].total || 0)
  };
};

module.exports = { listForProduct, upsertReview, getAverageForProduct };
