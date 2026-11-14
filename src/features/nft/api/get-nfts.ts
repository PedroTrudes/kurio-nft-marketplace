import { api } from "@/lib/axios";

import type {
  NFTListResponse,
} from "../types/nft.types";

export async function getNFTs(
  signal?: AbortSignal,
): Promise<NFTListResponse> {
  const response = await api.get<NFTListResponse>(
    "/nfts",
    {
      signal,
    },
  );

  return response.data;
}