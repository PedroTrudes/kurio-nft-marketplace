import type { NFT } from "@/features/nft/types/nft.types";

import { initialNFTs } from "../fixtures/nfts";

const NFT_STORAGE_KEY = "kurio-nfts";
const APPLIED_TRANSACTIONS_KEY = "kurio-stock-transactions";

export interface NFTStockItem {
  nftId: string;
  quantity: number;
}

interface StockTransactionRecord {
  transactionId: string;
  items: NFTStockItem[];
}

interface StockState {
  nfts: NFT[];
  transactions: StockTransactionRecord[];
}

function getInitialNFTs(): NFT[] {
  return initialNFTs.map((nft) => ({ ...nft }));
}

function isValidStoredNFT(value: unknown): value is NFT {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const nft = value as Record<string, unknown>;

  return (
    typeof nft.id === "string" &&
    typeof nft.name === "string" &&
    typeof nft.price === "string" &&
    nft.currency === "ETH" &&
    Number.isSafeInteger(nft.availableQuantity) &&
    Number(nft.availableQuantity) >= 0 &&
    Number.isSafeInteger(nft.version) &&
    Number(nft.version) >= 1
  );
}

function isValidTransaction(
  value: unknown,
): value is StockTransactionRecord {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.transactionId === "string" &&
    Array.isArray(record.items)
  );
}

function readLegacyNFTs(): NFT[] {
  try {
    const raw = localStorage.getItem(NFT_STORAGE_KEY);

    if (!raw) {
      return getInitialNFTs();
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return getInitialNFTs();
    }

    const storedNFTs = parsed.filter(isValidStoredNFT);

    const initialIds = new Set(initialNFTs.map((nft) => nft.id));
    const storedIds = new Set(storedNFTs.map((nft) => nft.id));

    if (
      storedNFTs.length !== initialNFTs.length ||
      storedIds.size !== initialIds.size ||
      [...storedIds].some((id) => !initialIds.has(id))
    ) {
      return getInitialNFTs();
    }

    return storedNFTs.map((nft) => ({ ...nft }));
  } catch {
    return getInitialNFTs();
  }
}

function readStockState(): StockState {
  try {
    const raw = localStorage.getItem(APPLIED_TRANSACTIONS_KEY);

    if (raw) {
      const parsed: unknown = JSON.parse(raw);

      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "nfts" in parsed &&
        "transactions" in parsed &&
        Array.isArray(parsed.nfts) &&
        Array.isArray(parsed.transactions)
      ) {
        const nfts = parsed.nfts.filter(isValidStoredNFT);
        const transactions = parsed.transactions.filter(
          isValidTransaction,
        );

        const initialIds = new Set(
          initialNFTs.map((nft) => nft.id),
        );

        if (
          nfts.length === initialNFTs.length &&
          new Set(nfts.map((nft) => nft.id)).size === initialIds.size &&
          nfts.every((nft) => initialIds.has(nft.id))
        ) {
          return {
            nfts: nfts.map((nft) => ({ ...nft })),
            transactions,
          };
        }
      }
    }
  } catch {
    // Recupera o estado anterior quando possível.
  }

  return {
    nfts: readLegacyNFTs(),
    transactions: [],
  };
}

const stockState = readStockState();

function persistStockState(state: StockState): void {
  localStorage.setItem(
    APPLIED_TRANSACTIONS_KEY,
    JSON.stringify(state),
  );
}

export function getAllNFTs(): NFT[] {
  return stockState.nfts.map((nft) => ({ ...nft }));
}

export function getNFTById(id: string): NFT | undefined {
  const nft = stockState.nfts.find((item) => item.id === id);

  return nft ? { ...nft } : undefined;
}

export function hasAvailableStock(
  id: string,
  quantity: number,
): boolean {
  const nft = getNFTById(id);

  return (
    nft !== undefined &&
    Number.isSafeInteger(quantity) &&
    quantity > 0 &&
    nft.availableQuantity >= quantity
  );
}

export function hasAppliedStockTransaction(
  transactionId: string,
): boolean {
  return stockState.transactions.some(
    (record) => record.transactionId === transactionId,
  );
}

function normalizeStockItems(
  items: NFTStockItem[],
): NFTStockItem[] {
  if (items.length === 0) {
    throw new Error("O pedido não possui NFTs.");
  }

  const quantities = new Map<string, number>();

  for (const item of items) {
    if (
      typeof item.nftId !== "string" ||
      !item.nftId.trim() ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1
    ) {
      throw new Error("Quantidade inválida no pedido.");
    }

    const total =
      (quantities.get(item.nftId) ?? 0) + item.quantity;

    if (!Number.isSafeInteger(total)) {
      throw new Error("Quantidade inválida no pedido.");
    }

    quantities.set(item.nftId, total);
  }

  return [...quantities.entries()]
    .map(([nftId, quantity]) => ({ nftId, quantity }))
    .sort((a, b) => a.nftId.localeCompare(b.nftId));
}

function getStockFingerprint(items: NFTStockItem[]): string {
  return JSON.stringify(normalizeStockItems(items));
}

export function applyStockTransaction(
  transactionId: string,
  items: NFTStockItem[],
): NFT[] {
  if (!transactionId.trim()) {
    throw new Error("Identificador da transação inválido.");
  }

  const normalizedItems = normalizeStockItems(items);

  const existingTransaction = stockState.transactions.find(
    (record) => record.transactionId === transactionId,
  );

  if (existingTransaction) {
    if (
      getStockFingerprint(existingTransaction.items) !==
      getStockFingerprint(normalizedItems)
    ) {
      throw new Error(
        "Transação já utilizada com itens diferentes.",
      );
    }

    return normalizedItems
      .map((item) => getNFTById(item.nftId))
      .filter((nft): nft is NFT => nft !== undefined);
  }

  const quantities = new Map(
    normalizedItems.map((item) => [
      item.nftId,
      item.quantity,
    ]),
  );

  // Valida todos os NFTs antes de modificar qualquer estoque.
  for (const { nftId, quantity } of normalizedItems) {
    const nft = stockState.nfts.find(
      (item) => item.id === nftId,
    );

    if (!nft) {
      throw new Error(`NFT não encontrado: ${nftId}`);
    }

    if (nft.availableQuantity < quantity) {
      throw new Error(
        `Estoque insuficiente para ${nft.name}.`,
      );
    }
  }

  const updatedNFTs = stockState.nfts.map((nft) => {
    const quantity = quantities.get(nft.id);

    if (quantity === undefined) {
      return { ...nft };
    }

    return {
      ...nft,
      availableQuantity: nft.availableQuantity - quantity,
      version: nft.version + 1,
    };
  });

  const updatedTransactions = [
    ...stockState.transactions,
    {
      transactionId,
      items: normalizedItems,
    },
  ];

  // Estoque e identificador da transação são persistidos juntos.
  persistStockState({
    nfts: updatedNFTs,
    transactions: updatedTransactions,
  });

  stockState.nfts = updatedNFTs;
  stockState.transactions = updatedTransactions;

  return updatedNFTs
    .filter((nft) => quantities.has(nft.id))
    .map((nft) => ({ ...nft }));
}

export function decreaseNFTStockBatch(
  items: NFTStockItem[],
): NFT[] {
  return applyStockTransaction(
    crypto.randomUUID(),
    items,
  );
}

export function decreaseNFTStock(
  id: string,
  quantity: number,
): NFT {
  const updatedNFTs = decreaseNFTStockBatch([
    {
      nftId: id,
      quantity,
    },
  ]);

  return updatedNFTs[0];
}