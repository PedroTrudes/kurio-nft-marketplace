import { useState } from "react";

import { useNavigate, useSearch } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import { useNFTs } from "@/features/nft/hooks/useNFTs";

import type {
  NFTFilters,
  NFTSort,
  NFTTab,
} from "@/features/nft/types/nft.types";

import Header from "@/components/layout/Header";
import HeroBanner from "@/components/home/HeroBanner";
import CatalogSearch from "@/components/home/CatalogSearch";
import MobileCatalogFilters from "@/components/home/MobileCatalogFilters";
import CatalogTabs from "@/components/home/CatalogTabs";
import NFTGrid from "@/components/nft/NFTGrid";

const categories = [
  { label: "Todas as categorias", value: "" },
  { label: "Arte Digital", value: "Arte Digital" },
  { label: "Colecionáveis", value: "Colecionáveis" },
];

const collections = [
  { label: "Todas as coleções", value: "" },
  { label: "Kurio Apes", value: "Kurio Apes" },
  { label: "Cosmic Collection", value: "Cosmic Collection" },
  { label: "Digital Nomads", value: "Digital Nomads" },
  { label: "Cyber World", value: "Cyber World" },
];

export default function HomePage() {
  const navigate = useNavigate({ from: "/" });

  const filters = useSearch({ from: "/" });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
    isPlaceholderData,
  } = useNFTs(filters);

  function updateFilters(updates: Partial<NFTFilters>) {
    navigate({
      search: (previous) => ({
        ...previous,
        ...updates,
        page: updates.page ?? 1,
      }),
    });
  }

  function handleCatalogSearch(value: string) {
    updateFilters({
      search: value,
    });
  }

  function handleTabChange(tab: NFTTab) {
    updateFilters({
      tab,
      page: 1,
    });
  }

  function handleClearFilters() {
    navigate({
      search: {
        search: "",
        category: "",
        collection: "",
        sort: "newest",
        tab: "all",
        page: 1,
        limit: 6,
      },
    });
  }

  const activeTab: NFTTab = filters.tab ?? "all";

  const currentPage = filters.page ?? 1;

  const totalPages = data?.totalPages ?? 0;

  return (
    <>
      <Header />

      <CatalogSearch
        key={filters.search ?? ""}
        initialSearch={filters.search ?? ""}
        onSearch={handleCatalogSearch}
        onOpenFilters={() => setMobileFiltersOpen(true)}
      />

      <MobileCatalogFilters
        open={mobileFiltersOpen}
        filters={filters}
        onClose={() => setMobileFiltersOpen(false)}
        onUpdateFilters={updateFilters}
        onClearFilters={handleClearFilters}
      />

      <HeroBanner />

      <main
        id="catalog"
        className="min-h-screen bg-kurio-background px-4 py-8 text-kurio-text sm:px-6 lg:px-8 lg:py-12"
      >
        <div className="mx-auto max-w-7xl">
          <section
            aria-label="Filtros do catálogo"
            className="mb-8 hidden gap-4 lg:grid lg:grid-cols-4"
          >
            <select
              aria-label="Filtrar por categoria"
              value={filters.category ?? ""}
              onChange={(event) =>
                updateFilters({
                  category: event.target.value,
                })
              }
              className="rounded-lg border border-kurio-border bg-kurio-surface px-4 py-3 text-kurio-text"
            >
              {categories.map((category) => (
                <option
                  key={category.value}
                  value={category.value}
                >
                  {category.label}
                </option>
              ))}
            </select>

            <select
              aria-label="Filtrar por coleção"
              value={filters.collection ?? ""}
              onChange={(event) =>
                updateFilters({
                  collection: event.target.value,
                })
              }
              className="rounded-lg border border-kurio-border bg-kurio-surface px-4 py-3 text-kurio-text"
            >
              {collections.map((collection) => (
                <option
                  key={collection.value}
                  value={collection.value}
                >
                  {collection.label}
                </option>
              ))}
            </select>

            <select
              aria-label="Ordenar NFTs"
              value={filters.sort ?? "newest"}
              onChange={(event) =>
                updateFilters({
                  sort: event.target.value as NFTSort,
                })
              }
              className="rounded-lg border border-kurio-border bg-kurio-surface px-4 py-3 text-kurio-text"
            >
              <option value="newest">Mais recentes</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="name-asc">Nome (A–Z)</option>
            </select>

            <Button
              type="button"
              variant="outline"
              onClick={handleClearFilters}
              className="border-kurio-border bg-transparent text-kurio-text hover:bg-kurio-surface hover:text-kurio-text"
            >
              Limpar filtros
            </Button>
          </section>

          <CatalogTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold md:text-2xl">
              NFTs disponíveis
            </h2>

            <div className="flex items-center gap-3 text-xs text-kurio-text-muted sm:text-sm">
              {data && (
                <span>{data.total} resultado(s)</span>
              )}

              {isFetching && (
                <span
                  role="status"
                  className="text-kurio-primary"
                >
                  Atualizando...
                </span>
              )}
            </div>
          </div>

          {isPending && (
            <div
              role="status"
              className="rounded-xl border border-kurio-border bg-kurio-surface p-10 text-center"
            >
              <p className="text-kurio-text-muted">
                Carregando NFTs...
              </p>
            </div>
          )}

          {isError && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/30 bg-kurio-surface p-8 text-center"
            >
              <h3 className="mb-3 text-xl font-semibold">
                Erro ao carregar NFTs
              </h3>

              <p className="mb-5 text-sm text-red-400">
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

          {!isPending && !isError && data && (
            <>
              {data.data.length === 0 ? (
                <div className="rounded-xl border border-kurio-border bg-kurio-surface p-10 text-center">
                  <h3 className="mb-2 text-xl font-semibold">
                    Nenhum NFT encontrado
                  </h3>

                  <p className="text-kurio-text-muted">
                    Tente modificar os filtros da busca.
                  </p>
                </div>
              ) : (
                <NFTGrid
                  nfts={data.data}
                  isFetching={isFetching}
                  isPlaceholderData={isPlaceholderData}
                />
              )}


              {totalPages > 1 && (
                <nav
                  aria-label="Paginação dos NFTs"
                  className="mt-20 flex items-center justify-center gap-4"
                >
                  <Button
                    type="button"
                    variant="outline"
                    disabled={
                      currentPage <= 1 ||
                      isPlaceholderData
                    }
                    onClick={() =>
                      updateFilters({
                        page: currentPage - 1,
                      })
                    }
                  >
                    Anterior
                  </Button>

                  <span className="text-center text-xs text-kurio-text-muted sm:text-sm">
                    Página {currentPage} de {totalPages}
                  </span>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={
                      currentPage >= totalPages ||
                      isPlaceholderData
                    }
                    onClick={() =>
                      updateFilters({
                        page: currentPage + 1,
                      })
                    }
                  >
                    Próxima
                  </Button>
                </nav>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}