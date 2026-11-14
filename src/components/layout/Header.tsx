import { Link, useRouterState } from "@tanstack/react-router";
import { Search, ShoppingCart, LogIn } from "lucide-react";

import { useCart } from "@/features/cart/hooks/useCart";

export default function Header() {
  const { data: cart } = useCart();

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const isHome = pathname === "/";
  const isCart = pathname === "/cart";

  return (
    <header className="hidden border-b border-kurio-border/40 bg-kurio-background md:block">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          className="text-sm font-bold tracking-[0.2em] text-kurio-text"
        >
          KURIO
        </Link>

        <nav
          aria-label="Navegação principal"
          className="flex items-center gap-9"
        >
          <Link
            to="/"
            className={`border-b-2 pb-2 text-sm font-semibold ${
              isHome
                ? "border-kurio-primary text-kurio-primary"
                : "border-transparent text-kurio-text-muted hover:text-kurio-primary"
            }`}
          >
            Início
          </Link>

          <Link
            to="/"
            className="pb-2 text-sm text-kurio-text-muted hover:text-kurio-primary"
          >
            Mercado
          </Link>

          <span className="pb-2 text-sm text-kurio-text-muted">
            Criadores
          </span>

          <span className="pb-2 text-sm text-kurio-text-muted">
            Aprenda
          </span>
        </nav>

        <div className="flex items-center gap-5">
          <Link
            to="/"
            aria-label="Buscar NFTs"
            className="text-kurio-text transition-colors hover:text-kurio-primary"
          >
            <Search size={20} />
          </Link>

          <Link
            to="/cart"
            aria-label={`Abrir carrinho com ${cart?.totalItems ?? 0} itens`}
            aria-current={isCart ? "page" : undefined}
            className={`relative transition-colors hover:text-kurio-primary ${
              isCart
                ? "text-kurio-primary"
                : "text-kurio-text"
            }`}
          >
            <ShoppingCart size={20} />

            {(cart?.totalItems ?? 0) > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-kurio-primary px-1 text-[10px] font-bold text-kurio-background">
                {cart?.totalItems}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="flex items-center gap-2 rounded-md bg-kurio-primary px-4 py-2 text-xs font-bold text-kurio-background transition-colors hover:bg-kurio-primary-hover"
          >
            <LogIn size={16} />
            Entrar
          </button>
        </div>
      </div>
    </header>
  );
}