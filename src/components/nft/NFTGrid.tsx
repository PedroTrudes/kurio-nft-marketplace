import NFTCard from "./NFTCard";

import type { NFT } from "@/features/nft/types/nft.types";

interface NFTGridProps {
  nfts: NFT[];
  isFetching?: boolean;
  isPlaceholderData?: boolean;
}

export default function NFTGrid({
  nfts,
  isFetching = false,
  isPlaceholderData = false,
}: NFTGridProps) {
  return (
    <div
      aria-busy={isFetching}
      className={`
        grid
        grid-cols-2
        items-start
        gap-x-3
        gap-y-5
        transition-opacity
        duration-200
        md:gap-4
        lg:grid-cols-3
        lg:gap-6
        ${isPlaceholderData ? "opacity-50" : ""}
      `}
    >
      {nfts.map((nft, index) => (
        <div
          key={nft.id}
          className={`
            min-w-0 
            ${index % 2 === 1 ? "translate-y-10 md:translate-y-0" : ""}
          `}
        >
          <NFTCard nft={nft} />
        </div>
      ))}
    </div>
  );
}