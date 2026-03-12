import { api } from "./api.js";
import { renderNav } from "./ui.js";

const form = document.querySelector("[data-register]");
const message = document.querySelector("[data-message]");

const init = async () => {
  await renderNav();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "";
    const payload = {
      name: form.name.value,
      email: form.email.value,
      password: form.password.value
    };

    try {
      await api("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });
      window.location.href = "/";
    } catch (err) {
      message.textContent = err.message;
    }
  });
};

init();
