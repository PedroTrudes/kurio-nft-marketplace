import { api } from "@/lib/axios";

import type {
  AddCartItemInput,
  Cart,
  UpdateCartItemInput,
} from "../types/cart.types";

export async function getCart(signal?: AbortSignal): Promise<Cart> {
  const response = await api.get<Cart>("/cart", {
    signal,
  });

  return response.data;
}

export async function addCartItem(
  input: AddCartItemInput,
): Promise<Cart> {
  const response = await api.post<Cart>("/cart/items", input);

  return response.data;
}

export async function updateCartItem(
  nftId: string,
  input: UpdateCartItemInput,
): Promise<Cart> {
  const response = await api.patch<Cart>(
    `/cart/items/${encodeURIComponent(nftId)}`,
    input,
  );

  return response.data;
}

export async function removeCartItem(nftId: string): Promise<Cart> {
  const response = await api.delete<Cart>(
    `/cart/items/${encodeURIComponent(nftId)}`,
  );

  return response.data;
}