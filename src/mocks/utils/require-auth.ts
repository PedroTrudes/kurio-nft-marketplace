import type { User } from "@/features/auth/types/auth.types";

import { getCurrentUser } from "../store/auth.store";

export async function requireAuth(request: Request): Promise<User> {
  const authorization = request.headers.get("Authorization");

  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : null;

  return await getCurrentUser(token);
}