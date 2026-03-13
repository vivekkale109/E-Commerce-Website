import { getCart } from "./state.js";
import { api } from "./api.js";


export const renderNav = async () => {
  const nav = document.querySelector("[data-nav]");
  if (!nav) return;

  let user = null;
  try {
    const data = await api("/api/auth/me");
    user = data.user;
  } catch (err) {
    user = null;
  }

  const cartCount = getCart().reduce((sum, item) => sum + item.quantity, 0);

  nav.innerHTML = `
    <div class="navbar">
      <div class="container">
        <a class="brand" href="/">Lumen Market</a>
        <div class="nav-links">
          <a href="/">Shop</a>
          <a href="/cart.html">Cart <span class="badge" data-cart-count>${cartCount}</span></a>
          ${
            user
              ? `${user.isAdmin ? `<a href="/admin.html">Admin</a>` : ""}<a href="/wishlist.html">Wishlist</a><a href="/orders.html">Orders</a><button class="button outline" data-logout>Logout</button>`
              : `<a href="/login.html">Login</a>`
          }
        </div>
      </div>
    </div>
  `;

  const logoutBtn = nav.querySelector("[data-logout]");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await api("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    });
  }
};

export const refreshCartBadge = () => {
  const badge = document.querySelector("[data-cart-count]");
  if (!badge) return;
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = count;
};

window.addEventListener("cart:updated", refreshCartBadge);
