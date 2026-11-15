import { Link } from "@tanstack/react-router";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import axios from "axios";

import Header from "@/components/layout/Header";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";

import { useCart } from "@/features/cart/hooks/useCart";

import {
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/features/cart/hooks/useCartMutations";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return (
      error.response?.data?.message ??
      "Não foi possível atualizar o carrinho."
    );
  }

  return "Não foi possível atualizar o carrinho.";
}

export default function CartPage() {
  const {
    data: cart,
    isPending,
    isError,
    error,
    refetch,
  } = useCart();

  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveCartItem();

  const isUpdating =
    updateMutation.isPending || removeMutation.isPending;

  function handleUpdateQuantity(
    nftId: string,
    quantity: number,
  ) {
    updateMutation.mutate({
      nftId,
      input: { quantity },
    });
  }

  function handleRemove(nftId: string) {
    removeMutation.mutate(nftId);
  }

  const mutationError =
    updateMutation.error ?? removeMutation.error;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-kurio-background text-kurio-text">
        <div className="mx-auto max-w-7xl px-4 pt-8 md:px-6 md:py-10">
          <div className="mb-8 flex items-center justify-between md:hidden">
            <Link
              to="/"
              aria-label="Voltar ao catálogo"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-kurio-surface text-kurio-primary"
            >
              <ArrowLeft size={20} />
            </Link>

            <h1 className="text-lg font-bold">
              Carrinho de NFTs
            </h1>

            <div className="w-10" />
          </div>

          <nav
            aria-label="Breadcrumb"
            className="mb-4 hidden text-xs font-bold md:block"
          >
            <Link to="/" className="hover:text-kurio-primary">
              Início
            </Link>

            <span className="mx-2">/</span>

            <Link to="/" className="hover:text-kurio-primary">
              Mercado
            </Link>

            <span className="mx-2">/</span>

            <span>Carrinho</span>
          </nav>

          {isPending && (
            <div
              role="status"
              className="rounded-xl bg-kurio-surface p-10 text-center"
            >
              Carregando carrinho...
            </div>
          )}

          {isError && (
            <div
              role="alert"
              className="rounded-xl bg-kurio-surface p-10 text-center"
            >
              <p className="mb-4 text-red-400">
                {getErrorMessage(error)}
              </p>

              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-md bg-kurio-primary px-5 py-2 text-sm font-bold text-kurio-background"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {cart && cart.items.length === 0 && (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl bg-kurio-surface px-6 py-12 text-center">
              <ShoppingBag
                size={44}
                className="mb-5 text-kurio-primary"
              />

              <h2 className="mb-2 text-xl font-bold">
                Seu carrinho está vazio
              </h2>

              <p className="mb-6 text-sm text-kurio-text-muted">
                Explore o marketplace e descubra NFTs para
                sua coleção.
              </p>

              <Link
                to="/"
                className="rounded-md bg-kurio-primary px-6 py-3 text-sm font-bold text-kurio-background"
              >
                Explorar NFTs
              </Link>
            </div>
          )}

          {cart && cart.items.length > 0 && (
            <>
              {mutationError && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-red-800/50 bg-red-950/30 p-4 text-sm text-red-400"
                >
                  {getErrorMessage(mutationError)}
                </div>
              )}

              <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_280px] lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
                
                <section aria-label="NFTs do carrinho">
                  <div className="mb-3 hidden grid-cols-[minmax(0,1.6fr)_0.7fr_0.7fr_0.7fr_32px] gap-4 border-b border-kurio-border pb-2 text-xs font-semibold md:grid">
                    <span>NFTs</span>
                    <span>Preço</span>
                    <span>Edições</span>
                    <span>Total</span>
                    <span />
                  </div>

                  <div className="space-y-3">
                    {cart.items.map((item) => (
                      <CartItem
                        key={item.nftId}
                        item={item}
                        isUpdating={isUpdating}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemove={handleRemove}
                      />
                    ))}
                  </div>
                </section>

                <CartSummary cart={cart} />
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}