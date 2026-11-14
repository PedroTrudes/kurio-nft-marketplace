import type {
  Order,
  OrderItem,
} from "@/features/orders/types/order.types";

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

  // Compatibilidade com pedidos criados pela versão anterior.
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

function createFingerprint(
  items: NFTStockItem[],
): string {
  return JSON.stringify(
    [...items]
      .sort((a, b) => a.nftId.localeCompare(b.nftId))
      .map(({ nftId, quantity }) => ({
        nftId,
        quantity,
      })),
  );
}

function getCartFingerprint(): string | null {
  const cart = getCart();

  if (cart.items.length === 0) {
    return null;
  }

  return createFingerprint(
    cart.items.map(({ nftId, quantity }) => ({
      nftId,
      quantity,
    })),
  );
}

function createOrderSnapshot(): {
  order: Order;
  stockItems: NFTStockItem[];
  fingerprint: string;
} {
  const cart = getCart();

  if (cart.items.length === 0) {
    throw new OrderStoreError(
      "Seu carrinho está vazio.",
      400,
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

  const stockItems = items.map(
    ({ nftId, quantity }) => ({
      nftId,
      quantity,
    }),
  );

  const order: Order = {
    id: crypto.randomUUID(),
    status: "confirmed",
    items,
    totalItems: cart.totalItems,
    subtotal: cart.totalPrice,
    discount: "0.00000000",
    networkFee: "0.00000000",
    totalPrice: cart.totalPrice,
    currency: "ETH",
    createdAt: new Date().toISOString(),
  };

  return {
    order,
    stockItems,
    fingerprint: createFingerprint(stockItems),
  };
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
    // Se a operação já foi aplicada, não desconta novamente.
    if (!hasAppliedStockTransaction(pending.order.id)) {
      applyStockTransaction(
        pending.order.id,
        pending.stockItems,
      );
    }

    const updatedState: OrderState = {
      records: [
        ...state.records,
        {
          idempotencyKey: pending.idempotencyKey,
          fingerprint: pending.fingerprint,
          order: pending.order,
        },
      ],
    };

    persistOrderState(updatedState);

    // A limpeza do carrinho acontece somente após confirmar o pedido.
    if (getCartFingerprint() === pending.fingerprint) {
      clearCart();
    }

    const remainingPending = readPendingOrders().filter(
      (item) =>
        item.idempotencyKey !== pending.idempotencyKey,
    );

    persistPendingOrders(remainingPending);

    return pending.order;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Estoque insuficiente")
    ) {
      throw new OrderStoreError(error.message, 409);
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

  const state = readOrderState();
  const pendingOrders = readPendingOrders();

  const existingRecord = state.records.find(
    (record) =>
      record.idempotencyKey === idempotencyKey,
  );

  const pendingOrder = pendingOrders.find(
    (item) => item.idempotencyKey === idempotencyKey,
  );

  const currentFingerprint = getCartFingerprint();

  // Uma chave já utilizada não pode representar outro carrinho.
  if (existingRecord) {
    if (
      currentFingerprint !== null &&
      existingRecord.fingerprint !== currentFingerprint
    ) {
      throw new OrderStoreError(
        "Chave de idempotência já utilizada para outra compra.",
        409,
      );
    }

    return existingRecord.order;
  }

  // Recuperar uma operação interrompida.
  if (pendingOrder) {
    if (
      currentFingerprint !== null &&
      pendingOrder.fingerprint !== currentFingerprint
    ) {
      throw new OrderStoreError(
        "Chave de idempotência já utilizada para outra compra.",
        409,
      );
    }

    return finalizePendingOrder(pendingOrder);
  }

  const snapshot = createOrderSnapshot();

  const pending: PendingOrder = {
    idempotencyKey,
    fingerprint: snapshot.fingerprint,
    order: snapshot.order,
    stockItems: snapshot.stockItems,
  };

  // Registrar a intenção antes de modificar o estoque.
  persistPendingOrders([
    ...pendingOrders,
    pending,
  ]);

  return finalizePendingOrder(pending);
}