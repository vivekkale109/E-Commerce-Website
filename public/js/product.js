import { api } from "./api.js";
import { addToCart, formatCurrency } from "./state.js";
import { renderNav } from "./ui.js";

const productWrap = document.querySelector("[data-product]");

const init = async () => {
  await renderNav();
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  const product = await api(`/api/products/${id}`);
  productWrap.innerHTML = `
    <div class="hero">
      <div>
        <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
          ${product.images
            .map((img) => `<img src="${img}" alt="${product.name}" />`)
            .join("")}
        </div>
      </div>
      <div class="hero-card">
        <h1>${product.name}</h1>
        <p>${product.description}</p>
        <p class="price" style="font-size: 20px;">${formatCurrency(product.price)}</p>
        <label>
          Quantity
          <input class="input" type="number" value="1" min="1" data-qty />
        </label>
        <button class="button" data-add>Add to Cart</button>
      </div>
    </div>
  `;

  const qtyInput = productWrap.querySelector("[data-qty]");
  productWrap.querySelector("[data-add]").addEventListener("click", () => {
    addToCart(product, Number(qtyInput.value || 1));
  });
};

init();
