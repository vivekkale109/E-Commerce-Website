const express = require("express");
const { authRequired } = require("../middleware/auth");
const Wishlist = require("../models/Wishlist");

const router = express.Router();

router.get("/", authRequired, async (req, res) => {
  const products = await Wishlist.listForUser(req.user.id);
  res.json(products);
});

router.get("/status/:productId", authRequired, async (req, res) => {
  const ok = await Wishlist.isInWishlist(req.user.id, req.params.productId);
  res.json({ inWishlist: ok });
});

router.post("/:productId", authRequired, async (req, res) => {
  await Wishlist.addToWishlist(req.user.id, req.params.productId);
  res.json({ ok: true });
});

router.delete("/:productId", authRequired, async (req, res) => {
  await Wishlist.removeFromWishlist(req.user.id, req.params.productId);
  res.json({ ok: true });
});

module.exports = router;
