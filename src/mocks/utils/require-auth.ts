import type { User } from "@/features/auth/types/auth.types";

import { getCurrentUser } from "../store/auth.store";

export function requireAuth(request: Request): User {
  const authorization = request.headers.get("Authorization");

  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : null;

  return getCurrentUser(token);
}