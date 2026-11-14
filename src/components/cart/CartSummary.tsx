import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { calculateOrderPricing } from "@/lib/order-pricing";
import type { Cart } from "@/features/cart/types/cart.types";

interface CartSummaryProps {
  cart: Cart;
}

export default function CartSummary({
  cart,
}: CartSummaryProps) {
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  function handleApplyCoupon(
    event: React.SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setCouponMessage(
      "Cupons promocionais ainda não estão disponíveis.",
    );
  }
  const pricing = calculateOrderPricing(cart.totalPrice);
  return (
    <aside className="rounded-t-[36px] bg-kurio-surface px-6 py-8 text-kurio-text md:rounded-none md:bg-transparent md:px-0 md:py-0">
      <h2 className="mb-5 hidden border-b border-kurio-border pb-2 text-sm font-bold md:block">
        Resumo da carteira
      </h2>

      <form
        onSubmit={handleApplyCoupon}
        className="mb-7"
      >
        <label
          htmlFor="cart-coupon"
          className="mb-2 hidden text-xs font-semibold md:block"
        >
          Código promocional
        </label>

        <div className="flex overflow-hidden rounded-full border border-kurio-border md:rounded-md">
          <input
            id="cart-coupon"
            type="text"
            value={coupon}
            onChange={(event) => {
              setCoupon(event.target.value);
              setCouponMessage("");
            }}
            placeholder="Digite o código promocional..."
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-xs text-kurio-text outline-none placeholder:text-kurio-text-muted"
          />

          <button
            type="submit"
            className="bg-kurio-primary px-5 text-sm font-bold text-kurio-background transition-colors hover:bg-kurio-primary-hover"
          >
            Aplicar
          </button>
        </div>

        {couponMessage && (
          <p
            role="status"
            className="mt-2 text-xs text-kurio-text-muted"
          >
            {couponMessage}
          </p>
        )}
      </form>

      <dl className="space-y-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt>Subtotal</dt>
          <dd>{pricing.totalPrice} ETH</dd>
        </div>

        <div className="flex justify-between gap-4">
          <dt>Desconto do lançamento</dt>
          <dd>(-) 0.00</dd>
        </div>

        <div className="flex justify-between gap-4">
          <dt>Taxa de rede</dt>

          <dd className="text-right">
            <span>{pricing.networkFee} ETH</span>

            <span className="mt-1 block text-[10px] text-kurio-primary">
              Taxa estimada
            </span>
          </dd>
        </div>

        <div className="flex justify-between gap-4 border-t border-kurio-border pt-5 text-base font-bold">
          <dt>Total</dt>

          <dd className="text-kurio-primary">
            {cart.totalPrice} ETH
          </dd>
        </div>
      </dl>

      <p className="mt-2 text-[10px] text-kurio-text-muted">
        Total sem taxa de rede. Valor final sujeito à
        validação no checkout.
      </p>

      <div className="mt-8 space-y-4">
        <Link
          to="/checkout"
          className="flex h-12 w-full items-center justify-center rounded-full bg-kurio-primary text-sm font-bold text-kurio-background transition-colors hover:bg-kurio-primary-hover md:rounded-md"
        >
          Conectar e finalizar
        </Link>

        <Link
          to="/"
          className="block text-center text-xs text-kurio-primary hover:underline"
        >
          Continuar explorando
        </Link>
      </div>
    </aside>
  );
}