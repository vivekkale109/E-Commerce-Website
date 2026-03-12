import { api } from "./api.js";

const guard = async () => {
  try {
    const { user } = await api("/api/auth/me");
    if (!user || !user.isAdmin) {
      window.location.href = "/login.html";
    }
  } catch (err) {
    window.location.href = "/login.html";
  }
};

guard();
