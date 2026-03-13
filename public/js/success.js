import { renderNav } from "./ui.js";


const message = document.querySelector("[data-success]");

const init = async () => {
  await renderNav();
  const params = new URLSearchParams(window.location.search);
  const pi = params.get("pi");
  message.textContent = pi
    ? `Payment ${pi} confirmed. Your order is being prepared.`
    : "Payment confirmed. Your order is being prepared.";
};

init();
