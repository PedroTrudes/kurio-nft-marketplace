import type { NFT } from "@/features/nft/types/nft.types";

import { initialNFTs } from "../fixtures/nfts";

const NFT_STORAGE_KEY = "kurio-nfts";

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

function readStoredNFTs(): NFT[] {
  try {
    const raw = localStorage.getItem(NFT_STORAGE_KEY);

    if (!raw) {
      return initialNFTs.map((nft) => ({ ...nft }));
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return initialNFTs.map((nft) => ({ ...nft }));
    }

    const storedNFTs = parsed.filter(isValidStoredNFT);

    if (storedNFTs.length !== initialNFTs.length) {
      return initialNFTs.map((nft) => ({ ...nft }));
    }

    return storedNFTs;
  } catch {
    return initialNFTs.map((nft) => ({ ...nft }));
  }
}

let nftStore = readStoredNFTs();

function persistNFTs(): void {
  localStorage.setItem(
    NFT_STORAGE_KEY,
    JSON.stringify(nftStore),
  );
}

export function getAllNFTs(): NFT[] {
  return nftStore.map((nft) => ({ ...nft }));
}

export function getNFTById(id: string): NFT | undefined {
  const nft = nftStore.find((item) => item.id === id);

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

export function decreaseNFTStock(
  id: string,
  quantity: number,
): NFT {
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new Error("Quantidade inválida.");
  }

  const nft = nftStore.find((item) => item.id === id);

  if (!nft) {
    throw new Error("NFT não encontrado.");
  }

  if (nft.availableQuantity < quantity) {
    throw new Error(
      "Estoque insuficiente para concluir a compra.",
    );
  }

  nft.availableQuantity -= quantity;
  nft.version += 1;

  persistNFTs();

  return { ...nft };
}