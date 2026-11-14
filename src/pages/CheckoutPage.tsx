import { useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AxiosError } from "axios";
import { ArrowLeft, LoaderCircle, ShieldCheck } from "lucide-react";

import Header from "@/components/layout/Header";

import { useCart } from "@/features/cart/hooks/useCart";
import { useCreateOrder } from "@/features/orders/hooks/useCreateOrder";

import { calculateOrderPricing } from "@/lib/order-pricing";

import type { OrderError } from "@/features/orders/types/order.types";

export default function CheckoutPage() {
  const navigate = useNavigate();

  const { data: cart, isLoading, isError } = useCart();

  const createOrder = useCreateOrder();

  const idempotencyRef = useRef<{
    fingerprint: string;
    key: string;
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calculamos todos os valores utilizando a mesma
  // regra de negócio utilizada pelo Order Store.
  const pricing = calculateOrderPricing(
    cart?.totalPrice ?? "0.00000000",
  );

  async function handleConfirmOrder() {
    if (
      !cart ||
      cart.items.length === 0 ||
      createOrder.isPending
    ) {
      return;
    }

    setErrorMessage(null);

    const items = cart.items.map(({ nftId, quantity }) => ({
      nftId,
      quantity,
    }));

    // Identifica o conteúdo da compra.
    // Ordenamos os itens para evitar diferenças
    // causadas apenas pela ordem no carrinho.
    const fingerprint = JSON.stringify(
      [...items].sort((a, b) =>
        a.nftId.localeCompare(b.nftId),
      ),
    );

    // Reutilizamos a chave quando o usuário tenta
    // novamente a mesma compra.
    //
    // Se os itens mudarem, criamos uma nova chave.
    if (
      !idempotencyRef.current ||
      idempotencyRef.current.fingerprint !== fingerprint
    ) {
      idempotencyRef.current = {
        fingerprint,
        key: crypto.randomUUID(),
      };
    }

    try {
      const order = await createOrder.mutateAsync({
        idempotencyKey: idempotencyRef.current.key,
        items,
      });

      await navigate({
        to: "/order/$orderId",
        params: {
          orderId: order.id,
        },
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        const responseData = error.response?.data as
          | OrderError
          | undefined;

        setErrorMessage(
          responseData?.message ??
            "Não foi possível finalizar o pedido.",
        );
      } else {
        setErrorMessage(
          "Ocorreu um erro inesperado. Tente novamente.",
        );
      }
    }
  }

  return (
    <div className="min-h-screen bg-kurio-background font-kurio text-kurio-text">
      <Header />

      <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 md:px-8 md:pt-12">
        <Link
          to="/cart"
          className="mb-8 inline-flex items-center gap-2 text-sm text-kurio-text-muted transition-colors hover:text-kurio-text"
        >
          <ArrowLeft size={16} />
          Voltar ao carrinho
        </Link>

        <div className="mb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-kurio-primary">
            Finalização de compra
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">
            Checkout
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-kurio-text-muted">
            Revise os itens antes de confirmar seu pedido.
          </p>
        </div>

        {isLoading ? (
          <div className="flex min-h-60 items-center justify-center">
            <LoaderCircle
              size={28}
              className="animate-spin text-kurio-primary"
            />
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-300">
            Não foi possível carregar seu carrinho.
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="rounded-xl border border-kurio-border bg-kurio-surface p-8 text-center">
            <h2 className="text-lg font-semibold">
              Seu carrinho está vazio
            </h2>

            <p className="mt-3 text-sm text-kurio-text-muted">
              Adicione NFTs ao carrinho para continuar.
            </p>

            <Link
              to="/"
              className="mt-6 inline-flex rounded-lg bg-kurio-primary px-6 py-3 text-sm font-semibold text-kurio-background"
            >
              Explorar NFTs
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="min-w-0">
              <div className="overflow-hidden rounded-xl border border-kurio-border bg-kurio-surface">
                <div className="border-b border-kurio-border px-5 py-5 md:px-6">
                  <h2 className="text-lg font-semibold">
                    Itens do pedido
                  </h2>

                  <p className="mt-2 text-xs text-kurio-text-muted">
                    {cart.totalItems} item(ns) selecionado(s)
                  </p>
                </div>

                <div className="divide-y divide-kurio-border">
                  {cart.items.map((item) => (
                    <div
                      key={item.nftId}
                      className="flex gap-4 p-5 md:p-6"
                    >
                      <img
                        src={item.nft.image}
                        alt={item.nft.name}
                        className="h-24 w-24 shrink-0 rounded-lg object-cover sm:h-28 sm:w-28"
                      />

                      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                        <div>
                          <p className="text-xs text-kurio-text-muted">
                            {item.nft.collection}
                          </p>

                          <h3 className="mt-1 text-sm font-semibold md:text-base">
                            {item.nft.name}
                          </h3>

                          <p className="mt-2 text-xs text-kurio-text-muted">
                            Quantidade: {item.quantity}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-kurio-text-muted">
                            Subtotal
                          </p>

                          <p className="mt-1 text-sm font-bold text-kurio-primary">
                            {Number(item.subtotal).toFixed(4)} ETH
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <aside className="h-fit rounded-xl border border-kurio-border bg-kurio-surface p-6">
              <h2 className="text-lg font-semibold">
                Resumo da compra
              </h2>

              <div className="mt-7 space-y-4 border-b border-kurio-border pb-6 text-sm">
           
                <div className="flex items-center justify-between gap-3">
                  <span className="text-kurio-text-muted">
                    Subtotal
                  </span>

                  <span>
                    {Number(pricing.subtotal).toFixed(4)} ETH
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-kurio-text-muted">
                    Desconto
                  </span>

                  <span>
                    {Number(pricing.discount).toFixed(4)} ETH
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-kurio-text-muted">
                    Taxa de rede
                  </span>

                  <span>
                    {Number(pricing.networkFee).toFixed(4)} ETH
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">
                  Total
                </span>

                <span className="text-xl font-bold text-kurio-primary">
                  {Number(pricing.totalPrice).toFixed(4)} ETH
                </span>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs leading-relaxed text-red-300"
                >
                  {errorMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={createOrder.isPending}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-kurio-primary px-5 py-4 text-sm font-bold text-kurio-background transition-colors hover:bg-kurio-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createOrder.isPending ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                    Processando pedido...
                  </>
                ) : (
                  "Confirmar compra"
                )}
              </button>

              <div className="mt-5 flex items-start gap-3 text-xs leading-relaxed text-kurio-text-muted">
                <ShieldCheck
                  size={18}
                  className="shrink-0 text-kurio-primary"
                />

                <p>
                  Compra simulada em ambiente de demonstração.
                  Nenhuma transação real será realizada.
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}