import { getNFTById } from "./nft.store";

import type {
  Cart,
  CartItem,
} from "@/features/cart/types/cart.types";

interface StoredCartItem {
  nftId: string;
  quantity: number;
}

const CART_STORAGE_PREFIX = "kurio-cart:";
const GUEST_CART_KEY = `${CART_STORAGE_PREFIX}guest`;
const SESSION_STORAGE_KEY = "kurio-auth-session";

const PRICE_DECIMALS = 8;
const PRICE_FACTOR = 10 ** PRICE_DECIMALS;

function getSessionUserId(): string | null {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const session: unknown = JSON.parse(stored);

    if (
      typeof session === "object" &&
      session !== null &&
      "user" in session &&
      typeof session.user === "object" &&
      session.user !== null &&
      "id" in session.user &&
      typeof session.user.id === "string"
    ) {
      return session.user.id;
    }
  } catch {
    return null;
  }

  return null;
}

function getCartStorageKey(): string {
  const userId = getSessionUserId();

  return userId
    ? `${CART_STORAGE_PREFIX}${userId}`
    : GUEST_CART_KEY;
}

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

function isStoredCartItem(
  value: unknown,
): value is StoredCartItem {
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

function readStoredItems(
  storageKey = getCartStorageKey(),
): StoredCartItem[] {
  try {
    const raw = localStorage.getItem(storageKey);

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

function writeStoredItems(
  items: StoredCartItem[],
  storageKey = getCartStorageKey(),
): void {
  localStorage.setItem(
    storageKey,
    JSON.stringify(items),
  );
}

function findNFT(nftId: string) {
  return getNFTById(nftId);
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

export function mergeGuestCart(userId: string): Cart {
  if (!userId) {
    throw new Error("Usuário inválido.");
  }

  const guestItems = readStoredItems(GUEST_CART_KEY);

  const userCartKey = `${CART_STORAGE_PREFIX}${userId}`;

  if (guestItems.length === 0) {
    return getCart();
  }

  const userItems = readStoredItems(userCartKey);

  const mergedItems = userItems.map((item) => ({
    ...item,
  }));

  for (const guestItem of guestItems) {
    const existingItem = mergedItems.find(
      (item) => item.nftId === guestItem.nftId,
    );

    const newQuantity =
      (existingItem?.quantity ?? 0) + guestItem.quantity;

    assertAvailableStock(
      guestItem.nftId,
      newQuantity,
    );

    if (existingItem) {
      existingItem.quantity = newQuantity;
    } else {
      mergedItems.push({
        ...guestItem,
      });
    }
  }

  writeStoredItems(mergedItems, userCartKey);

  localStorage.removeItem(GUEST_CART_KEY);

  return getCart();
}