const { getDb } = require("../config/db");

const listByUser = async (userId) => {
  const db = getDb();
  const [orders] = await db.query(
    "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );

  if (!orders.length) return [];

  const orderIds = orders.map((o) => o.id);
  const placeholders = orderIds.map(() => "?").join(",");
  const [items] = await db.query(
    `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
    orderIds
  );

  return orders.map((order) => ({
    _id: order.id,
    userId: order.user_id,
    total: Number(order.total),
    status: order.status,
    paymentIntentId: order.payment_intent_id,
    shipping: {
      fullName: order.shipping_full_name,
      address1: order.shipping_address1,
      address2: order.shipping_address2,
      city: order.shipping_city,
      state: order.shipping_state,
      postalCode: order.shipping_postal_code,
      country: order.shipping_country
    },
    items: items
      .filter((item) => item.order_id === order.id)
      .map((item) => ({
        productId: item.product_id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity
      })),
    createdAt: order.created_at
  }));
};

const findByPaymentIntent = async (paymentIntentId) => {
  const db = getDb();
  const [rows] = await db.query(
    "SELECT * FROM orders WHERE payment_intent_id = ? LIMIT 1",
    [paymentIntentId]
  );
  if (!rows[0]) return null;

  const order = rows[0];
  const [items] = await db.query("SELECT * FROM order_items WHERE order_id = ?", [order.id]);

  return {
    _id: order.id,
    userId: order.user_id,
    total: Number(order.total),
    status: order.status,
    paymentIntentId: order.payment_intent_id,
    shipping: {
      fullName: order.shipping_full_name,
      address1: order.shipping_address1,
      address2: order.shipping_address2,
      city: order.shipping_city,
      state: order.shipping_state,
      postalCode: order.shipping_postal_code,
      country: order.shipping_country
    },
    items: items.map((item) => ({
      productId: item.product_id,
      name: item.name,
      price: Number(item.price),
      quantity: item.quantity
    })),
    createdAt: order.created_at
  };
};

const createOrder = async ({ userId, items, shipping, total, status, paymentIntentId }) => {
  const db = getDb();
  const [result] = await db.query(
    `INSERT INTO orders
      (user_id, total, status, payment_intent_id, shipping_full_name, shipping_address1, shipping_address2, shipping_city, shipping_state, shipping_postal_code, shipping_country)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ,
    [
      userId,
      total,
      status,
      paymentIntentId,
      shipping?.fullName || "",
      shipping?.address1 || "",
      shipping?.address2 || "",
      shipping?.city || "",
      shipping?.state || "",
      shipping?.postalCode || "",
      shipping?.country || ""
    ]
  );

  const orderId = result.insertId;
  for (const item of items) {
    await db.query(
      "INSERT INTO order_items (order_id, product_id, name, price, quantity) VALUES (?, ?, ?, ?, ?)",
      [orderId, item.productId, item.name, item.price, item.quantity]
    );
  }

  return {
    _id: orderId,
    userId,
    items,
    shipping,
    total,
    status,
    paymentIntentId
  };
};

module.exports = { listByUser, findByPaymentIntent, createOrder };
