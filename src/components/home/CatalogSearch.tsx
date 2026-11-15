import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import MobileSearchBar from "@/components/home/MobileSearchBar";

interface CatalogSearchProps {
  initialSearch: string;
  onSearch: (value: string) => void;
  onOpenFilters: () => void;
}

export default function CatalogSearch({
  initialSearch,
  onSearch,
  onOpenFilters,
}: CatalogSearchProps) {
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Mantém o texto digitado enquanto o usuário edita,
  // mas acompanha mudanças externas na busca da URL.
  const [previousInitialSearch, setPreviousInitialSearch] =
    useState(initialSearch);

  if (initialSearch !== previousInitialSearch) {
    setPreviousInitialSearch(initialSearch);
    setSearchInput(initialSearch);
  }

  useEffect(() => {
    function handleToggleSearch() {
      setIsSearchOpen((previous) => !previous);
    }

    window.addEventListener(
      "kurio:toggle-search",
      handleToggleSearch,
    );

    return () => {
      window.removeEventListener(
        "kurio:toggle-search",
        handleToggleSearch,
      );
    };
  }, []);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    searchInputRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchOpen]);

  function submitSearch() {
    onSearch(searchInput.trim());
    setIsSearchOpen(false);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitSearch();
  }

  return (
    <>
      <MobileSearchBar
        value={searchInput}
        onChange={setSearchInput}
        onSearch={submitSearch}
        onOpenFilters={onOpenFilters}
      />

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none ${
          isSearchOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <form
            onSubmit={handleSearch}
            className="mx-auto mb-6 hidden max-w-7xl gap-3 px-8 md:flex"
          >
            <input
              ref={searchInputRef}
              type="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              placeholder="Buscar NFTs..."
              aria-label="Buscar NFTs"
              tabIndex={isSearchOpen ? 0 : -1}
              className="w-full rounded-lg border border-kurio-border bg-kurio-surface px-4 py-3 text-kurio-text outline-none focus:border-kurio-primary"
            />

            <Button
              type="submit"
              tabIndex={isSearchOpen ? 0 : -1}
              className="bg-kurio-primary text-kurio-background hover:bg-kurio-primary-hover"
            >
              Buscar
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}