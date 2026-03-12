const express = require("express");
const Stripe = require("stripe");
const Order = require("../models/Order");
const { authRequired } = require("../middleware/auth");
const { buildOrderFromItems } = require("./checkout");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

router.get("/", authRequired, async (req, res) => {
  const orders = await Order.listByUser(req.user.id);
  res.json(orders);
});

router.post("/confirm", authRequired, async (req, res) => {
  const { paymentIntentId, items, shipping } = req.body;
  if (!paymentIntentId || !Array.isArray(items)) {
    return res.status(400).json({ message: "Invalid order payload" });
  }

  const existing = await Order.findByPaymentIntent(paymentIntentId);
  if (existing) {
    return res.json(existing);
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const { orderItems, total } = await buildOrderFromItems(items);
    const order = await Order.createOrder({
      userId: req.user.id,
      items: orderItems,
      shipping: {
        fullName: shipping?.fullName || "",
        address1: shipping?.address1 || "",
        address2: shipping?.address2 || "",
        city: shipping?.city || "",
        state: shipping?.state || "",
        postalCode: shipping?.postalCode || "",
        country: shipping?.country || ""
      },
      total,
      status: "paid",
      paymentIntentId
    });

    return res.json(order);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Order confirmation failed" });
  }
});

module.exports = router;
