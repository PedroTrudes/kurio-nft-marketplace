import { http, HttpResponse } from "msw";

import type {
  NFT,
  NFTSort,
} from "@/features/nft/types/nft.types";

import { initialNFTs } from "../fixtures/nfts";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 50;

const validSortOptions: NFTSort[] = [
  "newest",
  "price-asc",
  "price-desc",
  "name-asc",
];

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function parsePositiveInteger(
  value: string | null,
  fallback: number,
): number {
  if (!value || !/^\d+$/.test(value)) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function comparePrices(
  first: NFT,
  second: NFT,
): number {
  const firstPrice = Number(first.price);
  const secondPrice = Number(second.price);

  if (firstPrice < secondPrice) return -1;
  if (firstPrice > secondPrice) return 1;

  return 0;
}

export const nftHandlers = [
  http.get("/api/nfts", ({ request }) => {
    const url = new URL(request.url);

    const search = normalizeText(
      url.searchParams.get("search") ?? "",
    );

    const category = normalizeText(
      url.searchParams.get("category") ?? "",
    );

    const collection = normalizeText(
      url.searchParams.get("collection") ?? "",
    );

    const requestedSort =
      url.searchParams.get("sort") ?? "newest";

    const sort: NFTSort = validSortOptions.includes(
      requestedSort as NFTSort,
    )
      ? (requestedSort as NFTSort)
      : "newest";

    const page = parsePositiveInteger(
      url.searchParams.get("page"),
      DEFAULT_PAGE,
    );

    const limit = Math.min(
      parsePositiveInteger(
        url.searchParams.get("limit"),
        DEFAULT_LIMIT,
      ),
      MAX_LIMIT,
    );

    let filteredNFTs = [...initialNFTs];

    if (search) {
      filteredNFTs = filteredNFTs.filter((nft) => {
        const name = normalizeText(nft.name);
        const nftCollection = normalizeText(nft.collection);

        return (
          name.includes(search) ||
          nftCollection.includes(search)
        );
      });
    }

    if (category) {
      filteredNFTs = filteredNFTs.filter(
        (nft) => normalizeText(nft.category) === category,
      );
    }

    if (collection) {
      filteredNFTs = filteredNFTs.filter(
        (nft) => normalizeText(nft.collection) === collection,
      );
    }

    switch (sort) {
      case "price-asc":
        filteredNFTs.sort(comparePrices);
        break;

      case "price-desc":
        filteredNFTs.sort((a, b) => comparePrices(b, a));
        break;

      case "name-asc":
        filteredNFTs.sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        break;

      case "newest":
      default:
        filteredNFTs.sort((a, b) =>
          b.id.localeCompare(a.id),
        );
        break;
    }

    const total = filteredNFTs.length;
    const totalPages = Math.ceil(total / limit);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedNFTs = filteredNFTs.slice(
      startIndex,
      endIndex,
    );

    return HttpResponse.json({
      data: paginatedNFTs,
      total,
      page,
      limit,
      totalPages,
    });
  }),
];