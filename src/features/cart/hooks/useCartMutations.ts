import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  addCartItem,
  removeCartItem,
  updateCartItem,
} from "../api/cart.api";

import { cartQueryKey } from "./useCart";

import type { UpdateCartItemInput } from "../types/cart.types";

export function useAddCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCartItem,

    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKey, cart);
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      nftId,
      input,
    }: {
      nftId: string;
      input: UpdateCartItemInput;
    }) => updateCartItem(nftId, input),

    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKey, cart);
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeCartItem,

    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKey, cart);
    },
  });
}