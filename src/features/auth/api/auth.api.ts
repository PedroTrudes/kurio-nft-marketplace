import { api } from "@/lib/axios";

import type {
  AuthSession,
  LoginInput,
  RegisterInput,
  User,
} from "../types/auth.types";

const SESSION_STORAGE_KEY = "kurio-auth-session";

export function getStoredSession(): AuthSession | null {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const parsed: unknown = JSON.parse(stored);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("token" in parsed) ||
      typeof parsed.token !== "string" ||
      !("user" in parsed)
    ) {
      return null;
    }

    return parsed as AuthSession;
  } catch {
    return null;
  }
}

export async function registerRequest(
  input: RegisterInput,
): Promise<AuthSession> {
  const response = await api.post<AuthSession>(
    "/auth/register",
    input,
  );

  return response.data;
}

export async function loginRequest(
  input: LoginInput,
): Promise<AuthSession> {
  const response = await api.post<AuthSession>(
    "/auth/login",
    input,
  );

  return response.data;
}

export async function getCurrentUserRequest(
  signal?: AbortSignal,
): Promise<User | null> {
  const session = getStoredSession();

  if (!session) {
    return null;
  }

  const response = await api.get<User>("/auth/me", {
    signal,
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  });

  return response.data;
}

export async function logoutRequest(): Promise<void> {
  const session = getStoredSession();

  if (!session) {
    return;
  }

  await api.post(
    "/auth/logout",
    undefined,
    {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    },
  );
}