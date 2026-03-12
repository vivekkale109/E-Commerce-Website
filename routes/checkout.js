const express = require("express");
const Stripe = require("stripe");
const Product = require("../models/Product");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const buildOrderFromItems = async (items) => {
  const ids = items.map((item) => Number(item.productId));
  const products = await Product.findByIds(ids);
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  let total = 0;
  const orderItems = items.map((item) => {
    const product = productMap.get(String(item.productId));
    if (!product) {
      throw new Error("Invalid product in cart");
    }
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const lineTotal = product.price * quantity;
    total += lineTotal;
    return {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity
    };
  });

  return { orderItems, total };
};

router.post("/create-payment-intent", authRequired, async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  try {
    const { orderItems, total } = await buildOrderFromItems(items);
    const amount = Math.round(total * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: process.env.STRIPE_CURRENCY || "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: req.user.id,
        items: JSON.stringify(orderItems.map((i) => ({ id: i.productId, q: i.quantity })))
      }
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      amount
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Payment intent failed" });
  }
});

module.exports = { router, buildOrderFromItems };
