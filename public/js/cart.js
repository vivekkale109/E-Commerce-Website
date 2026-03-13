import { getCart, updateQuantity, removeItem, cartTotal, formatCurrency } from "./state.js";
import { renderNav } from "./ui.js";


const list = document.querySelector("[data-cart-list]");
const totalEl = document.querySelector("[data-cart-total]");
const checkoutBtn = document.querySelector("[data-checkout]");

const renderCart = () => {
  const cart = getCart();
  if (cart.length === 0) {
    list.innerHTML = `<div class="notice">Your cart is empty. Start shopping on the home page.</div>`;
    totalEl.textContent = formatCurrency(0);
    checkoutBtn.disabled = true;
    return;
  }

  list.innerHTML = cart
    .map(
      (item) => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" />
        <div>
          <h3>${item.name}</h3>
          <p>${formatCurrency(item.price)}</p>
          <input class="input" type="number" min="1" value="${item.quantity}" data-qty="${item.productId}" />
        </div>
        <button class="button outline" data-remove="${item.productId}">Remove</button>
      </div>
    `
    )
    .join("");

  list.querySelectorAll("[data-qty]").forEach((input) => {
    input.addEventListener("change", () => {
      updateQuantity(input.dataset.qty, input.value);
      renderCart();
    });
  });

  list.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      removeItem(button.dataset.remove);
      renderCart();
    });
  });

  totalEl.textContent = formatCurrency(cartTotal());
  checkoutBtn.disabled = false;
};

const init = async () => {
  await renderNav();
  renderCart();
  checkoutBtn.addEventListener("click", () => {
    window.location.href = "/checkout.html";
  });
};

init();
