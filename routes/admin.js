const express = require("express");
const { authRequired } = require("../middleware/auth");
const { adminRequired } = require("../middleware/admin");
const Product = require("../models/Product");

const router = express.Router();

router.use(authRequired, adminRequired);

router.get("/products", async (req, res) => {
  const products = await Product.listProducts({ q: "", category: "all" });
  res.json(products);
});

router.post("/products", async (req, res) => {
  const { name, description, price, category, images, stock } = req.body;
  if (!name || !description || !price || !category) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const product = await Product.createProduct({
    name,
    description,
    price: Number(price),
    category,
    images: Array.isArray(images) ? images : [],
    stock: Number(stock || 0)
  });

  return res.status(201).json(product);
});

router.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, images, stock } = req.body;
  const updated = await Product.updateProduct(id, {
    name,
    description,
    price: price !== undefined ? Number(price) : undefined,
    category,
    images: Array.isArray(images) ? images : undefined,
    stock: stock !== undefined ? Number(stock) : undefined
  });

  if (!updated) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json(updated);
});

router.delete("/products/:id", async (req, res) => {
  const ok = await Product.deleteProduct(req.params.id);
  if (!ok) {
    return res.status(404).json({ message: "Product not found" });
  }
  return res.json({ ok: true });
});

module.exports = router;
