import { useState } from "react";

import {
  Link,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";

import {
  Search,
  ShoppingCart,
  LogIn,
  LogOut,
  UserRound,
  LoaderCircle,
} from "lucide-react";

import AuthModal from "@/components/auth/AuthModal";

import { useCart } from "@/features/cart/hooks/useCart";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLogout } from "@/features/auth/hooks/useAuthMutations";

export default function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const navigate = useNavigate();

  const { data: cart } = useCart();
  const { data: user, isPending: isAuthLoading } = useAuth();

  const logout = useLogout();

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const isHome = pathname === "/";
  const isCart = pathname === "/cart";

  function handleSearchClick() {
    if (!isHome) {
      navigate({ to: "/" }).then(() => {
        window.dispatchEvent(new Event("kurio:toggle-search"));
      });

      return;
    }

    window.dispatchEvent(new Event("kurio:toggle-search"));
  }

  async function handleLogout() {
    setLogoutError(null);

    try {
      await logout.mutateAsync();

      await navigate({
        to: "/",
        replace: true,
      });
    } catch {
      setLogoutError(
        "Não foi possível sair da conta. Tente novamente.",
      );
    }
  }

  return (
    <>
      <header className="
    sticky
    top-0
    z-50
    hidden
    w-full
    border-b
    border-kurio-border/60
    bg-kurio-background/95
    backdrop-blur-md
    md:block
  ">
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
            <button
              type="button"
              onClick={handleSearchClick}
              aria-label="Abrir busca de NFTs"
              title="Buscar NFTs"
              className="text-kurio-text transition-colors hover:text-kurio-primary"
            >
              <Search size={20} />
            </button>

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

            {isAuthLoading ? (
              <div
                aria-label="Verificando autenticação"
                className="flex h-9 items-center gap-2 text-kurio-text-muted"
              >
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              </div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-kurio-text">
                  <UserRound
                    size={18}
                    className="text-kurio-primary"
                  />

                  <span className="max-w-32 truncate text-xs font-semibold">
                    {user.username}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  aria-label="Sair da conta"
                  title="Sair da conta"
                  className="flex items-center gap-2 rounded-md border border-kurio-border px-3 py-2 text-xs font-semibold text-kurio-text transition-colors hover:border-kurio-primary hover:text-kurio-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {logout.isPending ? (
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <LogOut size={16} />
                  )}

                  Sair
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 rounded-md bg-kurio-primary px-4 py-2 text-xs font-bold text-kurio-background transition-colors hover:bg-kurio-primary-hover"
              >
                <LogIn size={16} />
                Entrar
              </button>
            )}
          </div>
        </div>

        {logoutError && (
          <p
            role="alert"
            className="mx-auto max-w-7xl px-6 pb-3 text-right text-xs text-red-400"
          >
            {logoutError}
          </p>
        )}
      </header>

      <AuthModal
        open={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
      />
    </>
  );
}