import { http, HttpResponse } from "msw";

import {
  createOrder,
  getOrderById,
  OrderStoreError,
} from "../store/order.store";

export const orderHandlers = [
  // CRIAR PEDIDO
  http.post("/api/orders", ({ request }) => {
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

      const order = createOrder(idempotencyKey);

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

  // CONSULTAR PEDIDO
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

    return HttpResponse.json(order);
  }),
];