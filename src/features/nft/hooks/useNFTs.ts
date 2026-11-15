import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

import { getNFTs } from "../api/get-nfts";

import type {
  NFTFilters,
} from "../types/nft.types";

export function useNFTs(filters: NFTFilters) {
  return useQuery({
    queryKey: ["nfts", filters],

    queryFn: ({ signal }) =>
      getNFTs(filters, signal),

    placeholderData: keepPreviousData,
  });
}