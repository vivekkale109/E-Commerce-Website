import { api } from "./api.js";
import { formatCurrency } from "./state.js";
import { renderNav } from "./ui.js";

const listEl = document.querySelector("[data-admin-list]");
const form = document.querySelector("[data-admin-form]");
const message = document.querySelector("[data-admin-message]");
const resetBtn = document.querySelector("[data-admin-reset]");

let editingId = null;

const setMessage = (text) => {
  message.textContent = text || "";
};

const renderList = (products) => {
  listEl.innerHTML = products
    .map(
      (product) => `
      <div class="cart-item">
        <img src="${product.images[0] || ""}" alt="${product.name}" />
        <div>
          <strong>${product.name}</strong>
          <div>${formatCurrency(product.price)}</div>
          <div>${product.category}</div>
        </div>
        <div>
          <button class="button outline" data-edit="${product._id}">Edit</button>
          <button class="button" data-delete="${product._id}">Delete</button>
        </div>
      </div>
    `
    )
    .join("");

  listEl.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => startEdit(btn.dataset.edit, products));
  });

  listEl.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this product?")) return;
      await api(`/api/admin/products/${btn.dataset.delete}`, { method: "DELETE" });
      await loadProducts();
    });
  });
};

const loadProducts = async () => {
  const products = await api("/api/admin/products");
  renderList(products);
};

const resetForm = () => {
  editingId = null;
  form.reset();
  form.images.value = "";
  setMessage("");
  form.querySelector("[data-submit]").textContent = "Add product";
};

const startEdit = (id, products) => {
  const product = products.find((p) => String(p._id) === String(id));
  if (!product) return;
  editingId = product._id;
  form.name.value = product.name;
  form.description.value = product.description;
  form.price.value = product.price;
  form.category.value = product.category;
  form.stock.value = product.stock;
  form.images.value = (product.images || []).join(", ");
  form.querySelector("[data-submit]").textContent = "Update product";
};

const parseImages = (value) =>
  value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const init = async () => {
  await renderNav();
  await loadProducts();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage("");

    const payload = {
      name: form.name.value.trim(),
      description: form.description.value.trim(),
      price: Number(form.price.value),
      category: form.category.value.trim(),
      stock: Number(form.stock.value || 0),
      images: parseImages(form.images.value)
    };

    try {
      if (editingId) {
        await api(`/api/admin/products/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        setMessage("Product updated.");
      } else {
        await api("/api/admin/products", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        setMessage("Product created.");
      }
      resetForm();
      await loadProducts();
    } catch (err) {
      setMessage(err.message);
    }
  });

  resetBtn.addEventListener("click", resetForm);
};

init();
