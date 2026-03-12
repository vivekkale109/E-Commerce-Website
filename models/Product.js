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

const createProduct = async ({ name, description, price, category, images, stock }) => {
  const db = getDb();
  const [result] = await db.query(
    "INSERT INTO products (name, description, price, category, images, stock) VALUES (?, ?, ?, ?, ?, ?)",
    [name, description, price, category, JSON.stringify(images || []), stock || 0]
  );
  return findById(result.insertId);
};

const updateProduct = async (id, updates) => {
  const fields = [];
  const values = [];

  if (updates.name !== undefined) {
    fields.push("name = ?");
    values.push(updates.name);
  }
  if (updates.description !== undefined) {
    fields.push("description = ?");
    values.push(updates.description);
  }
  if (updates.price !== undefined) {
    fields.push("price = ?");
    values.push(updates.price);
  }
  if (updates.category !== undefined) {
    fields.push("category = ?");
    values.push(updates.category);
  }
  if (updates.images !== undefined) {
    fields.push("images = ?");
    values.push(JSON.stringify(updates.images));
  }
  if (updates.stock !== undefined) {
    fields.push("stock = ?");
    values.push(updates.stock);
  }

  if (!fields.length) {
    return findById(id);
  }

  const db = getDb();
  values.push(id);
  const [result] = await db.query(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`, values);
  if (result.affectedRows === 0) return null;
  return findById(id);
};

const deleteProduct = async (id) => {
  const db = getDb();
  const [result] = await db.query("DELETE FROM products WHERE id = ?", [id]);
  return result.affectedRows > 0;
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
  createProduct,
  updateProduct,
  deleteProduct,
  replaceAll
};
