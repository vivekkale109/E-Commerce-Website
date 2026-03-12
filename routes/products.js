const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

router.get("/", async (req, res) => {
  const { q, category } = req.query;
  const products = await Product.listProducts({ q, category });
  res.json(products);
});

router.get("/categories", async (req, res) => {
  const categories = await Product.getCategories();
  res.json(categories);
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  return res.json(product);
});

module.exports = router;
