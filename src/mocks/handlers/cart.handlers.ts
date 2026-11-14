import {
  http,
  HttpResponse,
} from "msw";

import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../store/cart.store";

import type {
  AddCartItemInput,
  UpdateCartItemInput,
} from "@/features/cart/types/cart.types";

function handleCartError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : "Não foi possível atualizar o carrinho.";

  const status =
    message === "NFT não encontrado." ||
    message === "NFT não encontrado no carrinho."
      ? 404
      : message.includes("estoque")
        ? 409
        : 400;

  return HttpResponse.json(
    { message },
    { status },
  );
}

export const cartHandlers = [
  // CONSULTAR CARRINHO
  http.get("/api/cart", () => {
    return HttpResponse.json(getCart());
  }),

  // ADICIONAR ITEM
  http.post("/api/cart/items", async ({ request }) => {
    try {
      const body =
        (await request.json()) as AddCartItemInput;

      const cart = addCartItem(
        body.nftId,
        body.quantity,
      );

      return HttpResponse.json(cart, {
        status: 201,
      });
    } catch (error) {
      return handleCartError(error);
    }
  }),

  // ALTERAR QUANTIDADE
  http.patch(
    "/api/cart/items/:nftId",
    async ({ params, request }) => {
      try {
        const { nftId } = params;

        const body =
          (await request.json()) as UpdateCartItemInput;

        const cart = updateCartItem(
          String(nftId),
          body.quantity,
        );

        return HttpResponse.json(cart);
      } catch (error) {
        return handleCartError(error);
      }
    },
  ),

  // REMOVER ITEM
  http.delete(
    "/api/cart/items/:nftId",
    ({ params }) => {
      try {
        const cart = removeCartItem(
          String(params.nftId),
        );

        return HttpResponse.json(cart);
      } catch (error) {
        return handleCartError(error);
      }
    },
  ),
];