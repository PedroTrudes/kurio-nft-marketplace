import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  loginRequest,
  logoutRequest,
  registerRequest,
} from "../api/auth.api";

import { authQueryKey } from "./useAuth";

import type {
  AuthSession,
  User,
} from "../types/auth.types";

const SESSION_STORAGE_KEY = "kurio-auth-session";

function updateAuthCache(
  session: AuthSession,
  setQueryData: (user: User) => void,
) {
  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify(session),
  );

  setQueryData(session.user);
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginRequest,

    onSuccess: (session) => {
      updateAuthCache(session, (user) => {
        queryClient.setQueryData(authQueryKey, user);
      });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerRequest,

    onSuccess: (session) => {
      updateAuthCache(session, (user) => {
        queryClient.setQueryData(authQueryKey, user);
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutRequest,

    onSuccess: () => {
      localStorage.removeItem(SESSION_STORAGE_KEY);

      queryClient.setQueryData(authQueryKey, null);
    },
  });
}