import { http, HttpResponse } from "msw";

import {
  createOrder,
  getOrderById,
  OrderStoreError,
} from "../store/order.store";

import type {
  CreateOrderItemInput,
} from "@/features/orders/types/order.types";

interface CreateOrderRequestBody {
  items: CreateOrderItemInput[];
}

function isCreateOrderRequestBody(
  value: unknown,
): value is CreateOrderRequestBody {
  if (
    typeof value !== "object" ||
    value === null ||
    !("items" in value)
  ) {
    return false;
  }

  return Array.isArray(value.items);
}

export const orderHandlers = [
  http.post("/api/orders", async ({ request }) => {
    try {
      const idempotencyKey =
        request.headers.get("Idempotency-Key");

      if (!idempotencyKey) {
        return HttpResponse.json(
          {
            message: "Chave de idempotência obrigatória.",
          },
          {
            status: 400,
          },
        );
      }

      let body: unknown;

      try {
        body = await request.json();
      } catch {
        return HttpResponse.json(
          {
            message: "Corpo da requisição inválido.",
          },
          {
            status: 400,
          },
        );
      }

      if (!isCreateOrderRequestBody(body)) {
        return HttpResponse.json(
          {
            message: "Lista de itens obrigatória.",
          },
          {
            status: 400,
          },
        );
      }

      const order = createOrder(
        idempotencyKey,
        body.items,
      );

      return HttpResponse.json(order, {
        status: 201,
      });
    } catch (error) {
      if (error instanceof OrderStoreError) {
        return HttpResponse.json(
          {
            message: error.message,
          },
          {
            status: error.status,
          },
        );
      }

      return HttpResponse.json(
        {
          message: "Não foi possível criar o pedido.",
        },
        {
          status: 500,
        },
      );
    }
  }),

  http.get("/api/orders/:id", ({ params }) => {
    const order = getOrderById(String(params.id));

    if (!order) {
      return HttpResponse.json(
        {
          message: "Pedido não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    return HttpResponse.json(order, {
      status: 200,
    });
  }),
];