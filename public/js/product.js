import { api } from "./api.js";
import { addToCart, formatCurrency } from "./state.js";
import { renderNav } from "./ui.js";


const productWrap = document.querySelector("[data-product]");
const reviewList = document.querySelector("[data-review-list]");
const reviewSummary = document.querySelector("[data-review-summary]");
const reviewForm = document.querySelector("[data-review-form]");
const reviewMessage = document.querySelector("[data-review-message]");
const wishlistToggle = document.querySelector("[data-wishlist-toggle]");

let productId = null;

const renderReviews = ({ reviews, summary }) => {
  reviewSummary.textContent = summary.total
    ? `Average rating: ${summary.average.toFixed(1)} (${summary.total} reviews)`
    : "No reviews yet. Be the first to review.";

  if (!reviews.length) {
    reviewList.innerHTML = "";
    return;
  }

  reviewList.innerHTML = reviews
    .map(
      (review) => `
      <div class="order-card">
        <strong>${review.userName}</strong>
        <div>Rating: ${review.rating} / 5</div>
        <p>${review.comment || ""}</p>
        <small>${new Date(review.createdAt).toLocaleDateString()}</small>
      </div>
    `
    )
    .join("");
};

const loadReviews = async () => {
  const data = await api(`/api/reviews/${productId}`);
  renderReviews(data);
};

const updateWishlistState = async () => {
  try {
    const data = await api(`/api/wishlist/status/${productId}`);
    wishlistToggle.textContent = data.inWishlist ? "Remove from Wishlist" : "Add to Wishlist";
  } catch (err) {
    wishlistToggle.textContent = "Login for Wishlist";
  }
};

const init = async () => {
  await renderNav();
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;
  productId = id;

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

  await loadReviews();
  await updateWishlistState();

  wishlistToggle.addEventListener("click", async () => {
    try {
      const data = await api(`/api/wishlist/status/${productId}`);
      if (data.inWishlist) {
        await api(`/api/wishlist/${productId}`, { method: "DELETE" });
      } else {
        await api(`/api/wishlist/${productId}`, { method: "POST" });
      }
      await updateWishlistState();
    } catch (err) {
      reviewMessage.textContent = "Please log in to use wishlist.";
    }
  });

  reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    reviewMessage.textContent = "";
    try {
      await api(`/api/reviews/${productId}`, {
        method: "POST",
        body: JSON.stringify({
          rating: reviewForm.rating.value,
          comment: reviewForm.comment.value
        })
      });
      reviewForm.reset();
      await loadReviews();
    } catch (err) {
      reviewMessage.textContent = err.message;
    }
  });
};

init();
