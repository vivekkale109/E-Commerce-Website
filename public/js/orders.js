import { api } from "./api.js";
import { formatCurrency } from "./state.js";
import { renderNav } from "./ui.js";

const list = document.querySelector("[data-orders]");

const init = async () => {
  await renderNav();
  try {
    const orders = await api("/api/orders");
    if (orders.length === 0) {
      list.innerHTML = `<div class="notice">No orders yet. Your completed orders will show up here.</div>`;
      return;
    }

    list.innerHTML = orders
      .map(
        (order) => `
        <div class="order-card">
          <strong>Order ${order._id.slice(-6).toUpperCase()}</strong>
          <span>${new Date(order.createdAt).toLocaleDateString()}</span>
          <span>Total: ${formatCurrency(order.total)}</span>
          <span>Status: ${order.status}</span>
        </div>
      `
      )
      .join("");
  } catch (err) {
    list.innerHTML = `<div class="notice">Please log in to view your orders.</div>`;
  }
};

init();
