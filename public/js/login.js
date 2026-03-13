import { api } from "./api.js";
import { renderNav } from "./ui.js";


const form = document.querySelector("[data-login]");
const message = document.querySelector("[data-message]");

const init = async () => {
  await renderNav();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "";
    const payload = {
      email: form.email.value,
      password: form.password.value
    };

    try {
      await api("/api/auth/login", { method: "POST", body: JSON.stringify(payload) });
      window.location.href = "/";
    } catch (err) {
      message.textContent = err.message;
    }
  });
};

init();
