import { http, HttpResponse } from "msw";

import type {
  NFT,
  NFTSort,
  NFTTab,
} from "@/features/nft/types/nft.types";

import {
  getAllNFTs,
  getNFTById,
} from "../store/nft.store";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 50;

const TRENDING_THRESHOLD = 90;
const NEW_RELEASE_DAYS = 7;

const MOCK_CURRENT_DATE = new Date("2026-11-14T12:00:00Z");

const validSortOptions: NFTSort[] = [
  "newest",
  "price-asc",
  "price-desc",
  "name-asc",
];

const validTabOptions: NFTTab[] = [
  "all",
  "new",
  "trending",
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
  return Number(first.price) - Number(second.price);
}

function compareNewest(
  first: NFT,
  second: NFT,
): number {
  return (
    new Date(second.createdAt).getTime() -
    new Date(first.createdAt).getTime()
  );
}

function comparePopularity(
  first: NFT,
  second: NFT,
): number {
  return second.popularityScore - first.popularityScore;
}

function isNewRelease(nft: NFT): boolean {
  const createdAt = new Date(nft.createdAt).getTime();
  const currentDate = MOCK_CURRENT_DATE.getTime();

  const sevenDaysInMilliseconds =
    NEW_RELEASE_DAYS * 24 * 60 * 60 * 1000;

  return (
    createdAt <= currentDate &&
    createdAt >= currentDate - sevenDaysInMilliseconds
  );
}

export const nftHandlers = [
  // LISTAGEM DE NFTs
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

    const requestedTab =
      url.searchParams.get("tab") ?? "all";

    const tab: NFTTab = validTabOptions.includes(
      requestedTab as NFTTab,
    )
      ? (requestedTab as NFTTab)
      : "all";

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

    // Agora consultamos o estado atual do estoque.
    let filteredNFTs = getAllNFTs();

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

    switch (tab) {
      case "new":
        filteredNFTs = filteredNFTs.filter(isNewRelease);
        break;

      case "trending":
        filteredNFTs = filteredNFTs.filter(
          (nft) => nft.popularityScore >= TRENDING_THRESHOLD,
        );
        break;

      case "all":
      default:
        break;
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
        if (tab === "trending") {
          filteredNFTs.sort(comparePopularity);
        } else {
          filteredNFTs.sort(compareNewest);
        }
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

  // DETALHES DE UM NFT
  http.get("/api/nfts/:id", ({ params }) => {
    const id = String(params.id);

    const nft = getNFTById(id);

    if (!nft) {
      return HttpResponse.json(
        {
          message: "NFT não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    return HttpResponse.json(nft);
  }),
];