import { api } from "./api.js";
import { renderNav } from "./ui.js";
import { formatCurrency, addToCart } from "./state.js";


const listEl = document.querySelector("[data-wishlist]");

const renderList = (products) => {
  if (!products.length) {
    listEl.innerHTML = `<div class="notice">Your wishlist is empty.</div>`;
    return;
  }

  listEl.innerHTML = products
    .map(
      (product) => `
      <article class="card">
        <img src="${product.images[0] || ""}" alt="${product.name}" />
        <div class="card-body">
          <h3>${product.name}</h3>
          <div class="price">${formatCurrency(product.price)}</div>
          <p>${product.description}</p>
          <div class="card-actions">
            <a class="button outline" href="/product.html?id=${product._id}">View</a>
            <button class="button" data-add="${product._id}">Add to Cart</button>
          </div>
        </div>
      </article>
    `
    )
    .join("");

  listEl.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => {
      const product = products.find((p) => String(p._id) === button.dataset.add);
      addToCart(product, 1);
    });
  });
};

const init = async () => {
  await renderNav();
  try {
    const products = await api("/api/wishlist");
    renderList(products);
  } catch (err) {
    listEl.innerHTML = `<div class="notice">Please log in to view your wishlist.</div>`;
  }
};

init();
