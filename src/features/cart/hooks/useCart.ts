import { useQuery } from "@tanstack/react-query";

import { getCart } from "../api/cart.api";

export const cartQueryKey = ["cart"] as const;

export function useCart() {
  return useQuery({
    queryKey: cartQueryKey,

    queryFn: ({ signal }) => getCart(signal),

    staleTime: 0,
  });
}