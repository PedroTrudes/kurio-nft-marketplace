import type {
  CreateOrderItemInput,
  Order,
  OrderItem,
} from "@/features/orders/types/order.types";

import { calculateOrderPricing } from "@/lib/order-pricing";

import { clearCart, getCart } from "./cart.store";

import {
  applyStockTransaction,
  getNFTById,
  hasAppliedStockTransaction,
} from "./nft.store";

import type { NFTStockItem } from "./nft.store";

const ORDERS_STORAGE_KEY = "kurio-orders";
const PENDING_ORDERS_KEY = "kurio-pending-orders";
const LEGACY_IDEMPOTENCY_KEY = "kurio-order-idempotency";

interface PendingOrder {
  idempotencyKey: string;
  fingerprint: string;
  order: Order;
  stockItems: NFTStockItem[];
}

interface OrderRecord {
  idempotencyKey: string;
  fingerprint: string;
  order: Order;
}

interface OrderState {
  records: OrderRecord[];
}

export class OrderStoreError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);

    this.name = "OrderStoreError";
    this.status = status;
  }
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readOrderState(): OrderState {
  const stored = readStorage<unknown>(
    ORDERS_STORAGE_KEY,
    [],
  );

  if (
    typeof stored === "object" &&
    stored !== null &&
    "records" in stored &&
    Array.isArray(stored.records)
  ) {
    return {
      records: stored.records as OrderRecord[],
    };
  }

  if (Array.isArray(stored)) {
    const legacyOrders = stored as Order[];

    const legacyIdempotencyRecords = readStorage<
      Array<{
        key: string;
        orderId: string;
        fingerprint: string;
      }>
    >(LEGACY_IDEMPOTENCY_KEY, []);

    return {
      records: legacyOrders.map((order) => {
        const record = legacyIdempotencyRecords.find(
          (item) => item.orderId === order.id,
        );

        return {
          idempotencyKey:
            record?.key ?? `legacy-${order.id}`,
          fingerprint: record?.fingerprint ?? "",
          order,
        };
      }),
    };
  }

  return { records: [] };
}

function readPendingOrders(): PendingOrder[] {
  return readStorage<PendingOrder[]>(
    PENDING_ORDERS_KEY,
    [],
  );
}

function persistOrderState(state: OrderState): void {
  localStorage.setItem(
    ORDERS_STORAGE_KEY,
    JSON.stringify(state),
  );
}

function persistPendingOrders(
  orders: PendingOrder[],
): void {
  localStorage.setItem(
    PENDING_ORDERS_KEY,
    JSON.stringify(orders),
  );
}

function normalizeItems(
  items: CreateOrderItemInput[],
): NFTStockItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new OrderStoreError(
      "O pedido deve conter pelo menos um NFT.",
      400,
    );
  }

  const quantities = new Map<string, number>();

  for (const item of items) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof item.nftId !== "string" ||
      !item.nftId.trim() ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1
    ) {
      throw new OrderStoreError(
        "Itens inválidos no pedido.",
        400,
      );
    }

    const quantity =
      (quantities.get(item.nftId) ?? 0) + item.quantity;

    if (!Number.isSafeInteger(quantity)) {
      throw new OrderStoreError(
        "Quantidade inválida no pedido.",
        400,
      );
    }

    quantities.set(item.nftId, quantity);
  }

  return [...quantities.entries()]
    .map(([nftId, quantity]) => ({
      nftId,
      quantity,
    }))
    .sort((a, b) => a.nftId.localeCompare(b.nftId));
}

function createFingerprint(
  items: CreateOrderItemInput[],
): string {
  return JSON.stringify(normalizeItems(items));
}

function createOrderSnapshot(
  requestedItems: NFTStockItem[],
): {
  order: Order;
  stockItems: NFTStockItem[];
  fingerprint: string;
} {
  const cart = getCart();
  const pricing = calculateOrderPricing(cart.totalPrice);

  if (cart.items.length === 0) {
    throw new OrderStoreError(
      "Seu carrinho está vazio.",
      400,
    );
  }

  const cartFingerprint = createFingerprint(
    cart.items.map(({ nftId, quantity }) => ({
      nftId,
      quantity,
    })),
  );

  const requestFingerprint =
    createFingerprint(requestedItems);

  if (cartFingerprint !== requestFingerprint) {
    throw new OrderStoreError(
      "Os itens enviados não correspondem ao carrinho.",
      409,
    );
  }

  const items: OrderItem[] = cart.items.map(
    ({ nftId, quantity, subtotal }) => {
      const nft = getNFTById(nftId);

      if (!nft) {
        throw new OrderStoreError(
          `NFT não encontrado: ${nftId}`,
          404,
        );
      }

      if (nft.availableQuantity < quantity) {
        throw new OrderStoreError(
          `Estoque insuficiente para ${nft.name}.`,
          409,
        );
      }

      return {
        nftId,
        name: nft.name,
        image: nft.image,
        quantity,
        unitPrice: nft.price,
        subtotal,
        currency: "ETH",
      };
    },
  );

  const order: Order = {
    id: crypto.randomUUID(),
    status: "confirmed",
    items,
    totalItems: cart.totalItems,
    
    subtotal: pricing.subtotal,
    discount: pricing.discount,
    networkFee: pricing.networkFee,
    totalPrice: pricing.totalPrice,
    currency: "ETH",
    createdAt: new Date().toISOString(),
  };

  return {
    order,
    stockItems: requestedItems,
    fingerprint: requestFingerprint,
  };
}

function removePendingOrder(
  idempotencyKey: string,
): void {
  const remaining = readPendingOrders().filter(
    (item) => item.idempotencyKey !== idempotencyKey,
  );

  persistPendingOrders(remaining);
}

function finalizePendingOrder(
  pending: PendingOrder,
): Order {
  const state = readOrderState();

  const existing = state.records.find(
    (record) =>
      record.idempotencyKey === pending.idempotencyKey,
  );

  if (existing) {
    return existing.order;
  }

  try {
    if (!hasAppliedStockTransaction(pending.order.id)) {
      applyStockTransaction(
        pending.order.id,
        pending.stockItems,
      );
    }

    persistOrderState({
      records: [
        ...state.records,
        {
          idempotencyKey: pending.idempotencyKey,
          fingerprint: pending.fingerprint,
          order: pending.order,
        },
      ],
    });

    const cart = getCart();

    const currentFingerprint =
      cart.items.length > 0
        ? createFingerprint(
            cart.items.map(({ nftId, quantity }) => ({
              nftId,
              quantity,
            })),
          )
        : null;

    if (currentFingerprint === pending.fingerprint) {
      clearCart();
    }

    removePendingOrder(pending.idempotencyKey);

    return pending.order;
  } catch (error) {
    if (
      error instanceof Error &&
      (
        error.message.includes("Estoque insuficiente") ||
        error.message.includes("NFT não encontrado")
      )
    ) {
      removePendingOrder(pending.idempotencyKey);

      throw new OrderStoreError(
        error.message,
        error.message.includes("Estoque insuficiente")
          ? 409
          : 404,
      );
    }

    throw error;
  }
}

export function getOrderById(
  orderId: string,
): Order | undefined {
  return readOrderState().records.find(
    (record) => record.order.id === orderId,
  )?.order;
}

export function getAllOrders(): Order[] {
  return readOrderState().records.map(
    (record) => record.order,
  );
}

export function createOrder(
  idempotencyKey: string,
  items: CreateOrderItemInput[],
): Order {
  if (
    typeof idempotencyKey !== "string" ||
    idempotencyKey.trim().length < 8
  ) {
    throw new OrderStoreError(
      "Chave de idempotência inválida.",
      400,
    );
  }

  const requestedItems = normalizeItems(items);
  const fingerprint = createFingerprint(requestedItems);

  const state = readOrderState();
  const pendingOrders = readPendingOrders();

  const existingRecord = state.records.find(
    (record) =>
      record.idempotencyKey === idempotencyKey,
  );

  if (existingRecord) {
    if (existingRecord.fingerprint !== fingerprint) {
      throw new OrderStoreError(
        "Chave de idempotência já utilizada para outra compra.",
        409,
      );
    }

    return existingRecord.order;
  }

  const pendingOrder = pendingOrders.find(
    (item) => item.idempotencyKey === idempotencyKey,
  );

  if (pendingOrder) {
    if (pendingOrder.fingerprint !== fingerprint) {
      throw new OrderStoreError(
        "Chave de idempotência já utilizada para outra compra.",
        409,
      );
    }

    return finalizePendingOrder(pendingOrder);
  }

  const snapshot = createOrderSnapshot(requestedItems);

  const pending: PendingOrder = {
    idempotencyKey,
    fingerprint: snapshot.fingerprint,
    order: snapshot.order,
    stockItems: snapshot.stockItems,
  };

  persistPendingOrders([
    ...pendingOrders,
    pending,
  ]);

  return finalizePendingOrder(pending);
}