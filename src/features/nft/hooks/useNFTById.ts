import { useQuery } from "@tanstack/react-query";

import { getNFTById } from "../api/get-nft-by-id";

export function useNFTById(id: string) {
  return useQuery({
    queryKey: ["nft", id],

    queryFn: ({ signal }) => getNFTById(id, signal),

    enabled: Boolean(id),
  });
}