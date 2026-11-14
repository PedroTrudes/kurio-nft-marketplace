import { useState } from "react";

import { Link, useParams } from "@tanstack/react-router";

import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  ShieldCheck,
} from "lucide-react";

import axios from "axios";

import { Button } from "@/components/ui/button";

import Header from "@/components/layout/Header";

import { useNFTById } from "@/features/nft/hooks/useNFTById";

import { useAddCartItem } from "@/features/cart/hooks/useCartMutations";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return (
      error.response?.data?.message ??
      "Não foi possível adicionar o NFT ao carrinho."
    );
  }

  return "Não foi possível adicionar o NFT ao carrinho.";
}

export default function NFTDetailsPage() {
  const { nftId } = useParams({
    from: "/nft/$nftId",
  });

  const [quantity, setQuantity] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    data: nft,
    isPending,
    isError,
    error,
    refetch,
  } = useNFTById(nftId);

  const addCartMutation = useAddCartItem();

  async function handleAddToCart() {
    if (!nft) {
      return;
    }

    setSuccessMessage("");

    try {
      await addCartMutation.mutateAsync({
        nftId: nft.id,
        quantity,
      });

      setSuccessMessage(
        `${quantity} unidade(s) de ${nft.name} adicionada(s) ao carrinho.`,
      );
    } catch {
      // O erro será apresentado pelo estado da mutation.
    }
  }

  const stock = nft?.availableQuantity ?? 0;

  const isOutOfStock = stock === 0;

  const canAddToCart =
    !isOutOfStock &&
    quantity >= 1 &&
    quantity <= stock &&
    !addCartMutation.isPending;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-kurio-background px-4 py-8 text-kurio-text sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-kurio-text-muted transition-colors hover:text-kurio-primary"
          >
            <ArrowLeft size={18} />
            Voltar ao catálogo
          </Link>

          {isPending && (
            <div
              role="status"
              className="rounded-2xl border border-kurio-border bg-kurio-surface p-10 text-center"
            >
              Carregando detalhes do NFT...
            </div>
          )}

          {isError && (
            <div
              role="alert"
              className="rounded-2xl border border-kurio-border bg-kurio-surface p-10 text-center"
            >
              <h1 className="mb-3 text-xl font-bold">
                Não foi possível carregar o NFT
              </h1>

              <p className="mb-6 text-sm text-red-400">
                {error.message}
              </p>

              <Button
                type="button"
                onClick={() => refetch()}
                className="bg-kurio-primary text-kurio-background hover:bg-kurio-primary-hover"
              >
                Tentar novamente
              </Button>
            </div>
          )}

          {nft && (
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
              
              <section aria-label={`Imagem de ${nft.name}`}>
                <div className="overflow-hidden rounded-2xl border border-kurio-border bg-kurio-surface">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="aspect-square w-full object-cover"
                  />
                </div>
              </section>

              
              <section className="flex flex-col">
                <div className="mb-6">
                  <p className="mb-3 text-sm text-kurio-primary">
                    {nft.collection}
                  </p>

                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
                      {nft.name}
                    </h1>

                    <span
                      aria-hidden="true"
                      className="rounded-full border border-kurio-border p-3 text-kurio-text-muted"
                    >
                      <Heart size={20} />
                    </span>
                  </div>

                  <p className="mt-5 leading-7 text-kurio-text-muted">
                    {nft.description}
                  </p>
                </div>

               
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-kurio-border bg-kurio-surface p-4">
                    <p className="mb-2 text-xs text-kurio-text-muted">
                      Categoria
                    </p>

                    <p className="text-sm font-semibold">
                      {nft.category}
                    </p>
                  </div>

                  <div className="rounded-xl border border-kurio-border bg-kurio-surface p-4">
                    <p className="mb-2 text-xs text-kurio-text-muted">
                      Rede
                    </p>

                    <p className="text-sm font-semibold">
                      {nft.network}
                    </p>
                  </div>
                </div>

                <div className="mb-6 rounded-2xl border border-kurio-border bg-kurio-surface p-6">
                  <p className="mb-2 text-sm text-kurio-text-muted">
                    Preço atual
                  </p>

                  <p className="text-3xl font-bold text-kurio-primary">
                    {nft.price} {nft.currency}
                  </p>

                  <p className="mt-3 text-xs text-kurio-text-muted">
                    {stock} unidade(s) disponíveis
                  </p>
                </div>

                
                <div className="mb-6">
                  <label
                    htmlFor="nft-quantity"
                    className="mb-3 block text-sm font-semibold"
                  >
                    Quantidade
                  </label>

                  <div className="inline-flex items-center overflow-hidden rounded-xl border border-kurio-border bg-kurio-surface">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((previous) =>
                          Math.max(1, previous - 1),
                        )
                      }
                      disabled={
                        quantity <= 1 ||
                        addCartMutation.isPending
                      }
                      aria-label="Diminuir quantidade"
                      className="h-11 w-12 text-lg transition-colors hover:bg-kurio-surface-light disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      −
                    </button>

                    <output
                      id="nft-quantity"
                      className="flex h-11 min-w-12 items-center justify-center border-x border-kurio-border px-3 text-sm font-bold"
                    >
                      {quantity}
                    </output>

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((previous) =>
                          Math.min(stock, previous + 1),
                        )
                      }
                      disabled={
                        quantity >= stock ||
                        addCartMutation.isPending
                      }
                      aria-label="Aumentar quantidade"
                      className="h-11 w-12 text-lg transition-colors hover:bg-kurio-surface-light disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>

                
                <div className="space-y-4">
                  <Button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!canAddToCart}
                    className="h-12 w-full bg-kurio-primary text-kurio-background hover:bg-kurio-primary-hover"
                  >
                    <ShoppingCart size={18} />

                    {addCartMutation.isPending
                      ? "Adicionando..."
                      : isOutOfStock
                        ? "NFT esgotado"
                        : "Adicionar ao carrinho"}
                  </Button>

                  {successMessage && (
                    <p
                      role="status"
                      className="rounded-lg border border-green-700/50 bg-green-950/30 p-3 text-center text-sm text-green-400"
                    >
                      {successMessage}
                    </p>
                  )}

                  {addCartMutation.isError && (
                    <p
                      role="alert"
                      className="rounded-lg border border-red-700/50 bg-red-950/30 p-3 text-center text-sm text-red-400"
                    >
                      {getErrorMessage(addCartMutation.error)}
                    </p>
                  )}
                </div>

           
                <div className="mt-8 flex items-start gap-3 border-t border-kurio-border pt-6">
                  <ShieldCheck
                    size={20}
                    className="shrink-0 text-kurio-primary"
                  />

                  <p className="text-xs leading-6 text-kurio-text-muted">
                    Confira os detalhes do NFT antes de
                    continuar com a compra.
                  </p>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </>
  );
}