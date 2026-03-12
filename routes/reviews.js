const express = require("express");
const { authRequired } = require("../middleware/auth");
const Review = require("../models/Review");

const router = express.Router();

router.get("/:productId", async (req, res) => {
  const { productId } = req.params;
  const reviews = await Review.listForProduct(productId);
  const summary = await Review.getAverageForProduct(productId);
  res.json({ reviews, summary });
});

router.post("/:productId", authRequired, async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const ratingNum = Number(rating);
  if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  const review = await Review.upsertReview({
    productId,
    userId: req.user.id,
    rating: ratingNum,
    comment: comment || ""
  });

  return res.json(review);
});

module.exports = router;
