import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

import Header from "@/components/layout/Header";


import { useOrderById } from "@/features/orders/hooks/useOrderById";

export default function OrderConfirmationPage() {
  const { orderId } = useParams({
  from: "/order/$orderId",
});

  const {
    data: order,
    isLoading,
    isError,
  } = useOrderById(orderId);

  return (
    <div className="min-h-screen bg-kurio-background font-kurio text-kurio-text">
      <Header />

      <main className="mx-auto w-full max-w-4xl px-4 pb-20 pt-10 md:px-8 md:pt-16">
        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <LoaderCircle
              size={30}
              className="animate-spin text-kurio-primary"
            />
          </div>
        ) : isError || !order ? (
          <div className="rounded-xl border border-kurio-border bg-kurio-surface p-8 text-center">
            <h1 className="text-xl font-bold">
              Pedido não encontrado
            </h1>

            <p className="mt-3 text-sm text-kurio-text-muted">
              Não foi possível carregar os detalhes deste pedido.
            </p>

            <Link
              to="/"
              search={{
                search: "",
                category: "",
                collection: "",
                sort: "newest",
                tab: "all",
                page: 1,
                limit: 6,
              }}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-kurio-primary"
            >
              <ArrowLeft size={16} />
              Voltar ao início
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-10 text-center">
              <CheckCircle2
                size={60}
                className="mx-auto text-kurio-primary"
              />

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-kurio-primary">
                Pedido confirmado
              </p>

              <h1 className="mt-3 text-3xl font-bold md:text-4xl">
                Compra realizada com sucesso!
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-kurio-text-muted">
                Seu pedido foi registrado com sucesso.
                Confira abaixo os detalhes da compra.
              </p>
            </div>

            <section className="overflow-hidden rounded-xl border border-kurio-border bg-kurio-surface">
              <div className="border-b border-kurio-border p-6">
                <p className="text-xs text-kurio-text-muted">
                  Número do pedido
                </p>

                <p className="mt-2 break-all text-sm font-semibold">
                  {order.id}
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm">
                  <div>
                    <p className="text-xs text-kurio-text-muted">
                      Data da compra
                    </p>

                    <p className="mt-1">
                      {new Date(order.createdAt).toLocaleString(
                        "pt-BR",
                      )}
                    </p>
                  </div>

                  <span className="rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-semibold text-green-400">
                    Confirmado
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-lg font-semibold">
                  NFTs adquiridos
                </h2>

                <div className="mt-6 divide-y divide-kurio-border">
                  {order.items.map((item) => (
                    <div
                      key={item.nftId}
                      className="flex items-center gap-4 py-5 first:pt-0 last:pb-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-20 w-20 shrink-0 rounded-lg object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold">
                          {item.name}
                        </h3>

                        <p className="mt-2 text-xs text-kurio-text-muted">
                          Quantidade: {item.quantity}
                        </p>
                      </div>

                      <p className="text-sm font-bold text-kurio-primary">
                        {Number(item.subtotal).toFixed(4)} ETH
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 border-t border-kurio-border pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold">
                      Total pago
                    </span>

                    <span className="text-xl font-bold text-kurio-primary">
                      {Number(order.totalPrice).toFixed(4)} ETH
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-8 flex justify-center">
              <Link
                to="/"
                search={{
                  search: "",
                  category: "",
                  collection: "",
                  sort: "newest",
                  tab: "all",
                  page: 1,
                  limit: 6,
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-kurio-primary px-7 py-4 text-sm font-bold text-kurio-background transition-colors hover:bg-kurio-primary-hover"
              >
                <ArrowLeft size={16} />
                Continuar explorando
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}