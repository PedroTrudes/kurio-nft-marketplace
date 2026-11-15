import axios from "axios";

const SESSION_STORAGE_KEY = "kurio-auth-session";

export const api = axios.create({
  baseURL: "/api",
  timeout: 10000,

  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);

    if (!stored) {
      return config;
    }

    const session: unknown = JSON.parse(stored);

    if (
      typeof session === "object" &&
      session !== null &&
      "token" in session &&
      typeof session.token === "string" &&
      session.token.length > 0
    ) {
      config.headers.set(
        "Authorization",
        `Bearer ${session.token}`,
      );
    }
  } catch (error) {
    if (import.meta.env.DEV) {
    console.warn(
      "[Auth] Erro ao recuperar sessão do localStorage:",
      error,
    );
  }
  }

  return config;
});