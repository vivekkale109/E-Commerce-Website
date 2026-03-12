import { api } from "./api.js";
import { formatCurrency } from "./state.js";
import { renderNav } from "./ui.js";

const list = document.querySelector("[data-orders]");

const init = async () => {
  await renderNav();
  try {
    const orders = await api("/api/orders");
    if (orders.length === 0) {
      list.innerHTML = `<div class="notice">No orders yet. Your purchases will appear here.</div>`;
      return;
    }

    list.innerHTML = orders
      .map(
        (order) => `
        <div class="order-card">
          <div><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</div>
          <div><strong>Status:</strong> ${order.status}</div>
          <div><strong>Total:</strong> ${formatCurrency(order.total)}</div>
          <div><strong>Items:</strong> ${order.items
            .map((item) => `${item.name} x${item.quantity}`)
            .join(", ")}</div>
        </div>
      `
      )
      .join("");
  } catch (err) {
    list.innerHTML = `<div class="notice">Please login to view your orders.</div>`;
  }
};

init();
