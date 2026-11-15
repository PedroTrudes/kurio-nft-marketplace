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

import { mergeGuestCart } from "@/mocks/store/cart.store";

import type {
  AuthSession,
} from "../types/auth.types";

const SESSION_STORAGE_KEY = "kurio-auth-session";

function saveSession(session: AuthSession): void {
  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify(session),
  );
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginRequest,

    onSuccess: async (session) => {
      saveSession(session);

      queryClient.removeQueries({
        queryKey: ["cart"],
      });

      queryClient.removeQueries({
        queryKey: ["orders"],
      });

      queryClient.setQueryData(
        authQueryKey,
        session.user,
      );

      try {
        const mergedCart = mergeGuestCart(session.user.id);

        queryClient.setQueryData(
          ["cart"],
          mergedCart,
        );
      } catch (error) {
        console.warn(
          "[Cart] Não foi possível transferir o carrinho visitante:",
          error,
        );

        await queryClient.invalidateQueries({
          queryKey: ["cart"],
        });
      }
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerRequest,

    onSuccess: async (session) => {
      saveSession(session);

      queryClient.removeQueries({
        queryKey: ["cart"],
      });

      queryClient.removeQueries({
        queryKey: ["orders"],
      });

      queryClient.setQueryData(
        authQueryKey,
        session.user,
      );

      try {
        const mergedCart = mergeGuestCart(session.user.id);

        queryClient.setQueryData(
          ["cart"],
          mergedCart,
        );
      } catch (error) {
        console.warn(
          "[Cart] Não foi possível transferir o carrinho visitante:",
          error,
        );

        await queryClient.invalidateQueries({
          queryKey: ["cart"],
        });
      }
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

      queryClient.removeQueries({
        queryKey: ["cart"],
      });

      queryClient.removeQueries({
        queryKey: ["orders"],
      });
    },
  });
}