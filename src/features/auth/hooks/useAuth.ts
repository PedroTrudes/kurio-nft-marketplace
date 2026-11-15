import { useQuery } from "@tanstack/react-query";

import { getCurrentUserRequest } from "../api/auth.api";

export const authQueryKey = ["auth", "me"] as const;

export function useAuth() {
  return useQuery({
    queryKey: authQueryKey,

    queryFn: ({ signal }) =>
      getCurrentUserRequest(signal),

    staleTime: 60_000,

    retry: false,
  });
}