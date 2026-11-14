import { useQuery } from "@tanstack/react-query";

import { getOrderByIdRequest } from "../api/orders.api";

export function useOrderById(orderId: string) {
  return useQuery({
    queryKey: ["orders", orderId],

    queryFn: ({ signal }) =>
      getOrderByIdRequest(orderId, signal),

    enabled: Boolean(orderId),

    staleTime: 60_000,
  });
}