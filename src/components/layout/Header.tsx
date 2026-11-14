import { Link } from "@tanstack/react-router";
import { Search, ShoppingCart, LogIn } from "lucide-react";

export default function Header() {
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
            className="border-b-2 border-kurio-primary pb-2 text-sm font-semibold text-kurio-primary"
          >
            Início
          </Link>

          <span className="text-sm text-kurio-text-muted">Mercado</span>

          <span className="text-sm text-kurio-text-muted">Criadores</span>

          <span className="text-sm text-kurio-text-muted">Aprenda</span>
        </nav>

        <div className="flex items-center gap-5">
          <button
            type="button"
            aria-label="Buscar NFTs"
            className="text-kurio-text transition-colors hover:text-kurio-primary"
          >
            <Search size={20} />
          </button>

          <button
            type="button"
            aria-label="Abrir carrinho"
            className="relative text-kurio-text transition-colors hover:text-kurio-primary"
          >
            <ShoppingCart size={20} />

            <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-kurio-primary px-1 text-[10px] font-bold text-kurio-background">
              0
            </span>
          </button>

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
