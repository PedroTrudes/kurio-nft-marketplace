import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { createOrderRequest } from "../api/orders.api";

import type {
  CreateOrderInput,
  Order,
} from "../types/order.types";

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation<Order, Error, CreateOrderInput>({
    mutationFn: createOrderRequest,

    onSuccess: (order) => {
      queryClient.setQueryData(
        ["orders", order.id],
        order,
      );

      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["cart"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["nfts"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["nft"],
        }),
      ]);
    },
  });
}