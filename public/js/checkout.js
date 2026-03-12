import { api } from "./api.js";
import { getCart, cartTotal, formatCurrency, clearCart } from "./state.js";
import { renderNav } from "./ui.js";

const summary = document.querySelector("[data-summary]");
const totalEl = document.querySelector("[data-total]");
const form = document.querySelector("[data-checkout]");
const message = document.querySelector("[data-message]");
let stripe;
let cardElement;

const renderSummary = () => {
  const cart = getCart();
  summary.innerHTML = cart
    .map(
      (item) => `
      <div style="display:flex; justify-content: space-between;">
        <span>${item.name} x${item.quantity}</span>
        <span>${formatCurrency(item.price * item.quantity)}</span>
      </div>
    `
    )
    .join("");
  totalEl.textContent = formatCurrency(cartTotal());
};

const initStripe = async () => {
  const config = await api("/api/config");
  if (!config.stripePublishableKey) {
    throw new Error("Stripe publishable key not configured");
  }
  stripe = Stripe(config.stripePublishableKey);
  const elements = stripe.elements();
  cardElement = elements.create("card");
  cardElement.mount("#card-element");
};

const init = async () => {
  await renderNav();
  renderSummary();
  await initStripe();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "";

    const cart = getCart();
    if (cart.length === 0) {
      message.textContent = "Cart is empty.";
      return;
    }

    try {
      const items = cart.map((item) => ({ productId: item.productId, quantity: item.quantity }));
      const intent = await api("/api/checkout/create-payment-intent", {
        method: "POST",
        body: JSON.stringify({ items })
      });

      const { paymentIntent, error } = await stripe.confirmCardPayment(intent.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: form.fullName.value
          }
        }
      });

      if (error) {
        message.textContent = error.message;
        return;
      }

      const shipping = {
        fullName: form.fullName.value,
        address1: form.address1.value,
        address2: form.address2.value,
        city: form.city.value,
        state: form.state.value,
        postalCode: form.postalCode.value,
        country: form.country.value
      };

      await api("/api/orders/confirm", {
        method: "POST",
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          items,
          shipping
        })
      });

      clearCart();
      window.location.href = `/success.html?pi=${paymentIntent.id}`;
    } catch (err) {
      message.textContent = err.message;
    }
  });
};

init();
