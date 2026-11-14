import { useEffect } from "react";
import { X } from "lucide-react";

import type {
  NFTFilters,
  NFTSort,
} from "@/features/nft/types/nft.types";

interface MobileCatalogFiltersProps {
  open: boolean;
  filters: NFTFilters;
  onClose: () => void;
  onUpdateFilters: (updates: Partial<NFTFilters>) => void;
  onClearFilters: () => void;
}

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

export default function MobileCatalogFilters({
  open,
  filters,
  onClose,
  onUpdateFilters,
  onClearFilters,
}: MobileCatalogFiltersProps) {
  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Fechar filtros"
        onClick={onClose}
        className="absolute inset-0 bg-black/70"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-filters-title"
        className="absolute inset-y-0 right-0 flex w-[min(340px,90vw)] flex-col border-l border-kurio-border bg-kurio-background shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-kurio-border p-5">
          <h2
            id="mobile-filters-title"
            className="text-lg font-bold text-kurio-text"
          >
            Filtros
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar painel"
            className="text-kurio-text"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 space-y-7 overflow-y-auto p-5">
          <div>
            <label
              htmlFor="mobile-category"
              className="mb-3 block text-sm font-semibold text-kurio-text"
            >
              Categoria
            </label>

            <select
              id="mobile-category"
              value={filters.category ?? ""}
              onChange={(event) =>
                onUpdateFilters({
                  category: event.target.value,
                })
              }
              className="w-full rounded-lg border border-kurio-border bg-kurio-surface px-4 py-3 text-sm text-kurio-text"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="mobile-collection"
              className="mb-3 block text-sm font-semibold text-kurio-text"
            >
              Coleção
            </label>

            <select
              id="mobile-collection"
              value={filters.collection ?? ""}
              onChange={(event) =>
                onUpdateFilters({
                  collection: event.target.value,
                })
              }
              className="w-full rounded-lg border border-kurio-border bg-kurio-surface px-4 py-3 text-sm text-kurio-text"
            >
              {collections.map((collection) => (
                <option key={collection.value} value={collection.value}>
                  {collection.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="mobile-sort"
              className="mb-3 block text-sm font-semibold text-kurio-text"
            >
              Ordenar por
            </label>

            <select
              id="mobile-sort"
              value={filters.sort ?? "newest"}
              onChange={(event) =>
                onUpdateFilters({
                  sort: event.target.value as NFTSort,
                })
              }
              className="w-full rounded-lg border border-kurio-border bg-kurio-surface px-4 py-3 text-sm text-kurio-text"
            >
              <option value="newest">Mais recentes</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="name-asc">Nome (A–Z)</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 border-t border-kurio-border p-5">
          <button
            type="button"
            onClick={onClearFilters}
            className="w-full rounded-lg border border-kurio-border px-4 py-3 text-sm font-semibold text-kurio-text"
          >
            Limpar filtros
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-kurio-primary px-4 py-3 text-sm font-bold text-kurio-background"
          >
            Ver resultados
          </button>
        </div>
      </aside>
    </div>
  );
}