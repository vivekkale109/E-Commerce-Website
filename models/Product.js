const { getDb } = require("../config/db");

const mapProduct = (row) => ({
  _id: row.id,
  name: row.name,
  description: row.description,
  price: Number(row.price),
  category: row.category,
  images: Array.isArray(row.images) ? row.images : JSON.parse(row.images || "[]"),
  stock: row.stock,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const listProducts = async ({ q, category }) => {
  const db = getDb();
  const params = [];
  let sql = "SELECT * FROM products";
  const clauses = [];

  if (q) {
    clauses.push("(name LIKE ? OR description LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }
  if (category && category !== "all") {
    clauses.push("category = ?");
    params.push(category);
  }

  if (clauses.length) {
    sql += ` WHERE ${clauses.join(" AND ")}`;
  }

  sql += " ORDER BY created_at DESC";

  const [rows] = await db.query(sql, params);
  return rows.map(mapProduct);
};

const getCategories = async () => {
  const db = getDb();
  const [rows] = await db.query("SELECT DISTINCT category FROM products ORDER BY category ASC");
  return rows.map((row) => row.category);
};

const findById = async (id) => {
  const db = getDb();
  const [rows] = await db.query("SELECT * FROM products WHERE id = ? LIMIT 1", [id]);
  return rows[0] ? mapProduct(rows[0]) : null;
};

const findByIds = async (ids) => {
  const db = getDb();
  if (!ids.length) return [];
  const placeholders = ids.map(() => "?").join(",");
  const [rows] = await db.query(`SELECT * FROM products WHERE id IN (${placeholders})`, ids);
  return rows.map(mapProduct);
};

const replaceAll = async (products) => {
  const db = getDb();
  await db.query("DELETE FROM products");
  for (const product of products) {
    await db.query(
      "INSERT INTO products (name, description, price, category, images, stock) VALUES (?, ?, ?, ?, ?, ?)",
      [
        product.name,
        product.description,
        product.price,
        product.category,
        JSON.stringify(product.images),
        product.stock || 0
      ]
    );
  }
};

module.exports = {
  listProducts,
  getCategories,
  findById,
  findByIds,
  replaceAll
};
