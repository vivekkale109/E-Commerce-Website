const CART_KEY = "ecom_cart_v1";

export const getCart = () => {
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart:updated"));
};

export const addToCart = (product, quantity = 1) => {
  const cart = getCart();
  const existing = cart.find((item) => item.productId === product._id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity
    });
  }
  saveCart(cart);
};

export const updateQuantity = (productId, quantity) => {
  const cart = getCart();
  const item = cart.find((c) => c.productId === productId);
  if (item) {
    item.quantity = Math.max(1, Number(quantity) || 1);
  }
  saveCart(cart);
};

export const removeItem = (productId) => {
  const cart = getCart().filter((item) => item.productId !== productId);
  saveCart(cart);
};

export const clearCart = () => saveCart([]);

export const cartTotal = () =>
  getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);

export const formatCurrency = (value, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(value);
