import { useState } from "react";

import {
  useNavigate,
  useSearch,
} from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import HeroBanner from "@/components/home/HeroBanner";

import { useNFTs } from "@/features/nft/hooks/useNFTs";

import type {
  NFTFilters,
  NFTSort,
} from "@/features/nft/types/nft.types";

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

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
    isPlaceholderData,
  } = useNFTs(filters);

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

    updateFilters({
      search: searchInput.trim(),
    });
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
          className="mb-6 flex flex-col gap-3 sm:flex-row"
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

        <section className="mb-8 grid gap-4 md:grid-cols-4">
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
          <div
            aria-busy={isFetching}
            className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 ${
              isPlaceholderData ? "opacity-50" : ""
            }`}
          >
            {data.data.map((nft) => (
              <article
                key={nft.id}
                className="overflow-hidden rounded-xl border border-white/10 bg-[#241813]"
              >
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="aspect-square w-full object-cover"
                />

                <div className="p-5">
                  <h3 className="mb-2 text-xl font-semibold">
                    {nft.name}
                  </h3>

                  <p className="mb-4 text-sm text-gray-400">
                    {nft.collection}
                  </p>

                  <p className="text-lg font-bold text-[#D58B48]">
                    {nft.price} {nft.currency}
                  </p>

                  <p className="mt-2 text-sm text-gray-400">
                    Disponíveis: {nft.availableQuantity}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Paginação dos NFTs"
            className="mt-10 flex items-center justify-center gap-4"
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

