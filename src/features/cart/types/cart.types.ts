import type { NFT } from "@/features/nft/types/nft.types";

export interface CartItem {
  nftId: string;
  quantity: number;
  nft: NFT;
  subtotal: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: string;
  currency: "ETH";
}

export interface AddCartItemInput {
  nftId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}

export interface CartError {
  message: string;
}