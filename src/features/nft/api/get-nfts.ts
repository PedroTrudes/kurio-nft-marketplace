import { api } from "@/lib/axios";

import type {
  NFTFilters,
  NFTListResponse,
} from "../types/nft.types";

export async function getNFTs(
  filters: NFTFilters,
  signal?: AbortSignal,
): Promise<NFTListResponse> {
  const response = await api.get<NFTListResponse>(
    "/nfts",
    {
      params: filters,
      signal,
    },
  );

  return response.data;
}