import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";

import type { CartItem as CartItemType } from "@/features/cart/types/cart.types";

interface CartItemProps {
  item: CartItemType;
  isUpdating: boolean;
  onUpdateQuantity: (nftId: string, quantity: number) => void;
  onRemove: (nftId: string) => void;
}

export default function CartItem({
  item,
  isUpdating,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const { nft, quantity, subtotal } = item;

  const canDecrease = quantity > 1 && !isUpdating;
  const canIncrease =
    quantity < nft.availableQuantity && !isUpdating;

  return (
    <article className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 rounded-2xl bg-kurio-surface p-3 text-kurio-text md:grid-cols-[minmax(0,1.6fr)_0.7fr_0.7fr_0.7fr_32px] md:items-center md:gap-4 md:rounded-md md:p-0">
      <div className="contents md:flex md:min-w-0 md:items-center md:gap-3">
        <Link
          to="/nft/$nftId"
          params={{ nftId: nft.id }}
          className="row-span-2 overflow-hidden rounded-xl md:row-auto md:shrink-0 md:rounded-md"
        >
          <img
            src={nft.image}
            alt={nft.name}
            className="h-full min-h-24 w-24 object-cover md:h-16 md:w-16"
          />
        </Link>

        <div className="min-w-0 md:py-2">
          <Link
            to="/nft/$nftId"
            params={{ nftId: nft.id }}
            className="block truncate text-xs font-bold hover:text-kurio-primary sm:text-sm"
          >
            {nft.name}
          </Link>

          <p className="mt-1 text-xs text-kurio-text-muted">
            <span className="md:hidden">
              Edição: {quantity}/{nft.availableQuantity}
            </span>

            <span className="hidden md:inline">
              ID do token: {nft.id}
            </span>
          </p>

          <p className="mt-3 text-sm font-bold text-kurio-primary md:hidden">
            {subtotal} ETH
          </p>
        </div>
      </div>

      <p className="hidden text-xs font-semibold text-kurio-text-muted md:block">
        {nft.price} ETH
      </p>

      <div className="col-start-2 flex items-center justify-end gap-2 self-end md:col-auto md:justify-start md:self-auto">
        <button
          type="button"
          onClick={() => onUpdateQuantity(nft.id, quantity - 1)}
          disabled={!canDecrease}
          aria-label={`Diminuir quantidade de ${nft.name}`}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-kurio-primary text-kurio-background disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus size={14} />
        </button>

        <span className="min-w-4 text-center text-sm">
          {quantity}
        </span>

        <button
          type="button"
          onClick={() => onUpdateQuantity(nft.id, quantity + 1)}
          disabled={!canIncrease}
          aria-label={`Aumentar quantidade de ${nft.name}`}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-kurio-primary text-kurio-background disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={14} />
        </button>
      </div>

      <p className="hidden text-xs font-bold text-kurio-primary md:block">
        {subtotal} ETH
      </p>

      <button
        type="button"
        onClick={() => onRemove(nft.id)}
        disabled={isUpdating}
        aria-label={`Remover ${nft.name} do carrinho`}
        className="col-start-2 justify-self-end text-kurio-text-muted transition-colors hover:text-red-400 disabled:opacity-40 md:col-auto md:justify-self-center"
      >
        <Trash2 size={17} />
      </button>
    </article>
  );
}