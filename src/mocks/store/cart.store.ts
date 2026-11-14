import { initialNFTs } from "../fixtures/nfts";

import type {
  Cart,
  CartItem,
} from "@/features/cart/types/cart.types";

interface StoredCartItem {
  nftId: string;
  quantity: number;
}

const CART_STORAGE_KEY = "kurio-cart";

const PRICE_DECIMALS = 8;
const PRICE_FACTOR = 10 ** PRICE_DECIMALS;

function toPriceUnits(price: string): number {
  const [whole = "0", fraction = ""] = price.split(".");

  const normalizedFraction = fraction
    .padEnd(PRICE_DECIMALS, "0")
    .slice(0, PRICE_DECIMALS);

  return (
    Number(whole) * PRICE_FACTOR +
    Number(normalizedFraction)
  );
}

function formatPriceUnits(units: number): string {
  return (units / PRICE_FACTOR).toFixed(PRICE_DECIMALS);
}

function isStoredCartItem(value: unknown): value is StoredCartItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.nftId === "string" &&
    Number.isSafeInteger(item.quantity) &&
    Number(item.quantity) > 0
  );
}

function readStoredItems(): StoredCartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isStoredCartItem);
  } catch {
    return [];
  }
}

function writeStoredItems(items: StoredCartItem[]): void {
  localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify(items),
  );
}

function findNFT(nftId: string) {
  return initialNFTs.find((nft) => nft.id === nftId);
}

function assertValidQuantity(quantity: number): void {
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new Error(
      "A quantidade deve ser um número inteiro maior que zero.",
    );
  }
}

function assertAvailableStock(
  nftId: string,
  quantity: number,
): void {
  const nft = findNFT(nftId);

  if (!nft) {
    throw new Error("NFT não encontrado.");
  }

  if (quantity > nft.availableQuantity) {
    throw new Error(
      "Quantidade solicitada superior ao estoque disponível.",
    );
  }
}

export function getCart(): Cart {
  const storedItems = readStoredItems();

  const items: CartItem[] = storedItems.flatMap(
    ({ nftId, quantity }) => {
      const nft = findNFT(nftId);

      if (!nft) {
        return [];
      }

      const subtotalUnits =
        toPriceUnits(nft.price) * quantity;

      return [
        {
          nftId,
          quantity,
          nft,
          subtotal: formatPriceUnits(subtotalUnits),
        },
      ];
    },
  );

  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const totalUnits = items.reduce(
    (total, item) => total + toPriceUnits(item.subtotal),
    0,
  );

  return {
    items,
    totalItems,
    totalPrice: formatPriceUnits(totalUnits),
    currency: "ETH",
  };
}

export function addCartItem(
  nftId: string,
  quantity: number,
): Cart {
  assertValidQuantity(quantity);

  const items = readStoredItems();

  const existingItem = items.find(
    (item) => item.nftId === nftId,
  );

  const newQuantity =
    (existingItem?.quantity ?? 0) + quantity;

  assertAvailableStock(nftId, newQuantity);

  if (existingItem) {
    existingItem.quantity = newQuantity;
  } else {
    items.push({
      nftId,
      quantity,
    });
  }

  writeStoredItems(items);

  return getCart();
}

export function updateCartItem(
  nftId: string,
  quantity: number,
): Cart {
  assertValidQuantity(quantity);

  const items = readStoredItems();

  const existingItem = items.find(
    (item) => item.nftId === nftId,
  );

  if (!existingItem) {
    throw new Error("NFT não encontrado no carrinho.");
  }

  assertAvailableStock(nftId, quantity);

  existingItem.quantity = quantity;

  writeStoredItems(items);

  return getCart();
}

export function removeCartItem(nftId: string): Cart {
  const items = readStoredItems();

  const updatedItems = items.filter(
    (item) => item.nftId !== nftId,
  );

  writeStoredItems(updatedItems);

  return getCart();
}

export function clearCart(): Cart {
  writeStoredItems([]);

  return getCart();
}