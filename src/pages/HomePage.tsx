import { useState } from "react";

import {
  useNavigate,
  useSearch,
} from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import { useNFTs } from "@/features/nft/hooks/useNFTs";

import type {
  NFTFilters,
  NFTSort,
} from "@/features/nft/types/nft.types";

import Header from "@/components/layout/Header";
import HeroBanner from "@/components/home/HeroBanner";
import NFTGrid from "@/components/nft/NFTGrid";
import MobileSearchBar from "@/components/home/MobileSearchBar";
import MobileCatalogFilters from "@/components/home/MobileCatalogFilters";

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

  const [searchInput, setSearchInput] = useState(
    filters.search ?? "",
  );

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

  function submitSearch(){
    updateFilters({
      search: searchInput.trim(),
    })
  }

  function updateFilters(
    updates: Partial<NFTFilters>,
  ) {
    navigate({
      search: (previous) => ({
        ...previous,
        ...updates,
        page: updates.page ?? 1,
      }),
    });
  }

  function handleSearch(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    submitSearch();
  }

  function handleClearFilters() {
    setSearchInput("");

    navigate({
      search: {
        search: "",
        category: "",
        collection: "",
        sort: "newest",
        page: 1,
        limit: 6,
      },
    });
  }

  const currentPage = filters.page ?? 1;
  const totalPages = data?.totalPages ?? 0;

  if (isPending) {
    return (
      <main className="min-h-screen bg-[#140D0A] p-10 text-white">
        <p>Carregando NFTs...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-[#140D0A] p-10 text-white">
        <h1 className="mb-4 text-2xl font-bold">
          Erro ao carregar NFTs
        </h1>

        <p className="mb-4 text-red-400">
          {error.message}
        </p>

        <Button onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </main>
    );
  }

  return (
<>
  <Header />
    <MobileSearchBar 
      value={searchInput}
      onChange={setSearchInput}
      onSearch={submitSearch}
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

<main className="min-h-screen bg-[#140D0A] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <h1 className="mb-3 text-4xl font-bold text-[#D58B48]">
            KURIO NFT MARKETPLACE
          </h1>

          <p className="text-gray-400">
            Explore nossa coleção de NFTs exclusivos.
          </p>
        </header>

        <form
          onSubmit={handleSearch}
          className="mb-6 hidden flex-col gap-3 lg:flex lg:flex-row"
        >
          <input
            type="search"
            value={searchInput}
            onChange={(event) =>
              setSearchInput(event.target.value)
            }
            placeholder="Buscar NFTs..."
            className="w-full rounded-lg border border-white/15 bg-[#241813] px-4 py-3 text-white outline-none focus:border-[#D58B48]"
          />

          <Button
            type="submit"
            className="bg-[#D58B48] text-[#140D0A] hover:bg-[#E5A365]"
          >
            Buscar
          </Button>
        </form>

        <section className="mb-8 hidden gap-4 lg:grid lg:grid-cols-4">
          <select
            aria-label="Filtrar por categoria"
            value={filters.category ?? ""}
            onChange={(event) =>
              updateFilters({
                category: event.target.value,
              })
            }
            className="rounded-lg border border-white/15 bg-[#241813] px-4 py-3 text-white"
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
            className="rounded-lg border border-white/15 bg-[#241813] px-4 py-3 text-white"
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
            className="rounded-lg border border-white/15 bg-[#241813] px-4 py-3 text-white"
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
            className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            Limpar filtros
          </Button>
        </section>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">
            NFTs disponíveis
          </h2>

          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>
              {data.total} resultado(s)
            </span>

            {isFetching && (
              <span className="text-[#D58B48]">
                Atualizando...
              </span>
            )}
          </div>
        </div>

        {data.data.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#241813] p-10 text-center">
            <h3 className="mb-2 text-xl font-semibold">
              Nenhum NFT encontrado
            </h3>

            <p className="text-gray-400">
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

            <span className="text-sm text-gray-300">
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
      </div>
    </main>
    </>
  );
}

