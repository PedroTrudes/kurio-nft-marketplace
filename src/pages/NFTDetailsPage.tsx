import { Link, useParams } from "@tanstack/react-router";

import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import Header from "@/components/layout/Header";

import { useNFTById } from "@/features/nft/hooks/useNFTById";

export default function NFTDetailsPage() {
  const { nftId } = useParams({
    from: "/nft/$nftId",
  });

  const {
    data: nft,
    isPending,
    isError,
    error,
    refetch,
  } = useNFTById(nftId);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-kurio-background px-4 py-8 text-kurio-text sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          {/* VOLTAR */}
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-kurio-text-muted transition-colors hover:text-kurio-primary"
          >
            <ArrowLeft size={18} />
            Voltar ao catálogo
          </Link>

          {/* CARREGAMENTO */}
          {isPending && (
            <div
              role="status"
              className="rounded-2xl border border-kurio-border bg-kurio-surface p-10 text-center"
            >
              Carregando detalhes do NFT...
            </div>
          )}

          {/* ERRO */}
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

          {/* DETALHES */}
          {nft && (
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
              {/* IMAGEM */}
              <section aria-label={`Imagem de ${nft.name}`}>
                <div className="overflow-hidden rounded-2xl border border-kurio-border bg-kurio-surface">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="aspect-square w-full object-cover"
                  />
                </div>
              </section>

              {/* INFORMAÇÕES */}
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

                {/* DADOS */}
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

                {/* PREÇO */}
                <div className="mb-6 rounded-2xl border border-kurio-border bg-kurio-surface p-6">
                  <p className="mb-2 text-sm text-kurio-text-muted">
                    Preço atual
                  </p>

                  <p className="text-3xl font-bold text-kurio-primary">
                    {nft.price} {nft.currency}
                  </p>

                  <p className="mt-3 text-xs text-kurio-text-muted">
                    {nft.availableQuantity} unidade(s) disponíveis
                  </p>
                </div>

                {/* AÇÕES */}
                <div className="space-y-4">
                  <Button
                    type="button"
                    disabled
                    className="h-12 w-full bg-kurio-primary text-kurio-background hover:bg-kurio-primary-hover"
                  >
                    <ShoppingCart size={18} />
                    Adicionar ao carrinho
                  </Button>

                  <p className="text-center text-xs text-kurio-text-muted">
                    Carrinho disponível na próxima etapa.
                  </p>
                </div>

                {/* INFORMAÇÃO */}
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