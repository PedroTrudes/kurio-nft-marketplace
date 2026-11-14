import { Search, SlidersHorizontal } from "lucide-react";

interface MobileSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onOpenFilters: () => void;
}

export default function MobileSearchBar({
  value,
  onChange,
  onSearch,
  onOpenFilters,
}: MobileSearchBarProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-5 sm:px-6 lg:hidden">
      <div className="flex items-center gap-3">
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            onSearch();
          }}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-kurio-surface px-4"
        >
          <Search
            size={20}
            className="shrink-0 text-kurio-text-muted"
            aria-hidden="true"
          />

          <input
            type="search"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Explorar coleções"
            aria-label="Explorar coleções"
            className="h-12 min-w-0 w-full bg-transparent text-sm text-kurio-text outline-none placeholder:text-kurio-text-muted"
          />
        </form>

        <button
          type="button"
          onClick={onOpenFilters}
          aria-label="Abrir filtros"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-kurio-primary text-kurio-background transition-colors hover:bg-kurio-primary-hover"
        >
          <SlidersHorizontal size={21} />
        </button>
      </div>
    </div>
  );
}