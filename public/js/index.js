import { api } from "./api.js";
import { addToCart, formatCurrency } from "./state.js";
import { renderNav } from "./ui.js";


const productGrid = document.querySelector("[data-product-grid]");
const searchInput = document.querySelector("[data-search]");
const categorySelect = document.querySelector("[data-category]");

const renderProducts = (products) => {
  productGrid.innerHTML = products
    .map(
      (product) => `
      <article class="card">
        <img src="${product.images[0]}" alt="${product.name}" />
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

  productGrid.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => {
      const product = products.find((p) => p._id === button.dataset.add);
      addToCart(product, 1);
    });
  });
};

const loadProducts = async () => {
  const params = new URLSearchParams();
  if (searchInput.value) params.set("q", searchInput.value);
  if (categorySelect.value) params.set("category", categorySelect.value);
  const data = await api(`/api/products?${params.toString()}`);
  renderProducts(data);
};

const loadCategories = async () => {
  const categories = await api("/api/products/categories");
  categorySelect.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
};

const init = async () => {
  await renderNav();
  await loadCategories();
  await loadProducts();

  searchInput.addEventListener("input", () => {
    loadProducts();
  });
  categorySelect.addEventListener("change", () => {
    loadProducts();
  });
};

init();
