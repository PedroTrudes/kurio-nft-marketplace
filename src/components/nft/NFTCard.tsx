import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import type { NFT } from "@/features/nft/types/nft.types";

interface NFTCardProps {
  nft: NFT;
}

export default function NFTCard({ nft }: NFTCardProps) {
  return (
    <article
      className="
        group
        min-w-0
        overflow-hidden
        rounded-2xl
        border
        border-kurio-border/40
        bg-kurio-surface
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-kurio-primary/50
      "
    >
      <Link
        to="/nft/$nftId"
        params={{ nftId: nft.id }}
        aria-label={`Ver detalhes de ${nft.name}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kurio-primary"
      >
        {/* IMAGEM */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={nft.image}
            alt={nft.name}
            loading="lazy"
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
          />

          <span
            className="
              absolute
              bottom-3
              left-3
              max-w-[calc(100%-24px)]
              truncate
              rounded-md
              bg-kurio-background/85
              px-2
              py-1
              text-[10px]
              text-kurio-text
              backdrop-blur-sm
            "
          >
            {nft.category}
          </span>

          <span
            aria-hidden="true"
            className="
              absolute
              right-3
              top-3
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              bg-kurio-background/75
              text-kurio-text
              backdrop-blur-sm
            "
          >
            <Heart size={16} />
          </span>
        </div>

        <div className="space-y-3 p-3 sm:p-4">
          <div className="min-w-0">
            <p className="mb-1 truncate text-[10px] text-kurio-text-muted sm:text-xs">
              {nft.collection}
            </p>

            <h3 className="truncate text-xs font-bold text-kurio-text sm:text-sm">
              {nft.name}
            </h3>
          </div>

          <div className="border-t border-kurio-border/40 pt-3">
            <p className="mb-1 text-[10px] text-kurio-text-muted">
              Preço
            </p>

            <p className="text-xs font-bold text-kurio-primary sm:text-base">
              {nft.price} {nft.currency}
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}