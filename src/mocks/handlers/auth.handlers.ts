import { http, HttpResponse } from "msw";

import {
  AuthStoreError,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../store/auth.store";

import type {
  LoginInput,
  RegisterInput,
} from "@/features/auth/types/auth.types";

function handleAuthError(error: unknown): Response {
  if (error instanceof AuthStoreError) {
    return HttpResponse.json(
      { message: error.message },
      { status: error.status },
    );
  }

  return HttpResponse.json(
    { message: "Ocorreu um erro interno na autenticação." },
    { status: 500 },
  );
}

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();

  return token || null;
}

export const authHandlers = [
  http.post("/api/auth/register", async ({ request }) => {
    try {
      let body: RegisterInput;

      try {
        body = (await request.json()) as RegisterInput;
      } catch {
        return HttpResponse.json(
          { message: "Corpo da requisição inválido." },
          { status: 400 },
        );
      }

      const session = registerUser(body);

      return HttpResponse.json(session, {
        status: 201,
      });
    } catch (error) {
      return handleAuthError(error);
    }
  }),

  http.post("/api/auth/login", async ({ request }) => {
    try {
      let body: LoginInput;

      try {
        body = (await request.json()) as LoginInput;
      } catch {
        return HttpResponse.json(
          { message: "Corpo da requisição inválido." },
          { status: 400 },
        );
      }

      const session = loginUser(body);

      return HttpResponse.json(session, {
        status: 200,
      });
    } catch (error) {
      return handleAuthError(error);
    }
  }),

  http.get("/api/auth/me", ({ request }) => {
    try {
      const token = getBearerToken(request);

      const user = getCurrentUser(token);

      return HttpResponse.json(user, {
        status: 200,
      });
    } catch (error) {
      return handleAuthError(error);
    }
  }),

  http.post("/api/auth/logout", ({ request }) => {
    try {
      const token = getBearerToken(request);

      getCurrentUser(token);

      logoutUser();

      return new HttpResponse(null, {
        status: 204,
      });
    } catch (error) {
      return handleAuthError(error);
    }
  }),
];