import { http, HttpResponse } from "msw";

import {
  createOrder,
  getOrderById,
  OrderStoreError,
} from "../store/order.store";

import { AuthStoreError } from "../store/auth.store";
import { requireAuth } from "../utils/require-auth";

import type {
  CreateOrderItemInput,
} from "@/features/orders/types/order.types";

interface CreateOrderRequestBody {
  items: CreateOrderItemInput[];
}

const ORDER_OWNERS_STORAGE_KEY = "kurio-order-owners";

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

function readOrderOwners(): Record<string, string> {
  try {
    const stored = localStorage.getItem(
      ORDER_OWNERS_STORAGE_KEY,
    );

    if (!stored) {
      return {};
    }

    const parsed: unknown = JSON.parse(stored);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}

function saveOrderOwner(
  orderId: string,
  userId: string,
): void {
  const owners = readOrderOwners();

  owners[orderId] = userId;

  localStorage.setItem(
    ORDER_OWNERS_STORAGE_KEY,
    JSON.stringify(owners),
  );
}

function handleOrderError(error: unknown) {
  if (
    error instanceof AuthStoreError ||
    error instanceof OrderStoreError
  ) {
    return HttpResponse.json(
      { message: error.message },
      { status: error.status },
    );
  }

  return HttpResponse.json(
    { message: "Não foi possível processar o pedido." },
    { status: 500 },
  );
}

export const orderHandlers = [
  http.post("/api/orders", async ({ request }) => {
    try {
      const user = requireAuth(request);

      const idempotencyKey =
        request.headers.get("Idempotency-Key");

      if (!idempotencyKey) {
        return HttpResponse.json(
          {
            message: "Chave de idempotência obrigatória.",
          },
          { status: 400 },
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
          { status: 400 },
        );
      }

      if (!isCreateOrderRequestBody(body)) {
        return HttpResponse.json(
          {
            message: "Lista de itens obrigatória.",
          },
          { status: 400 },
        );
      }

      // Evita colisões de chaves de idempotência entre contas.
      const scopedIdempotencyKey =
        `${user.id}:${idempotencyKey}`;

      const order = createOrder(
        scopedIdempotencyKey,
        body.items,
      );

      const existingOwner = readOrderOwners()[order.id];

      if (existingOwner && existingOwner !== user.id) {
        return HttpResponse.json(
          { message: "Acesso não autorizado ao pedido." },
          { status: 403 },
        );
      }

      saveOrderOwner(order.id, user.id);

      return HttpResponse.json(order, {
        status: 201,
      });
    } catch (error) {
      return handleOrderError(error);
    }
  }),

  http.get("/api/orders/:id", ({ params, request }) => {
    try {
      const user = requireAuth(request);

      const orderId = String(params.id);

      const order = getOrderById(orderId);

      if (!order) {
        return HttpResponse.json(
          { message: "Pedido não encontrado." },
          { status: 404 },
        );
      }

      const ownerId = readOrderOwners()[orderId];

      if (ownerId !== user.id) {
        return HttpResponse.json(
          { message: "Pedido não encontrado." },
          { status: 404 },
        );
      }

      return HttpResponse.json(order, {
        status: 200,
      });
    } catch (error) {
      return handleOrderError(error);
    }
  }),
];