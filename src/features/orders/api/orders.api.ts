import { api } from "@/lib/axios";

import type {
  CreateOrderInput,
  Order,
} from "../types/order.types";

export async function createOrderRequest({
  idempotencyKey,
  items,
}: CreateOrderInput): Promise<Order> {
  const response = await api.post<Order>(
    "/orders",
    { items },
    {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    },
  );

  return response.data;
}

export async function getOrderByIdRequest(
  orderId: string,
  signal?: AbortSignal,
): Promise<Order> {
  const response = await api.get<Order>(
    `/orders/${encodeURIComponent(orderId)}`,
    { signal },
  );

  return response.data;
}