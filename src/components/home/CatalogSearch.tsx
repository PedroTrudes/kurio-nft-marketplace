import { useState } from "react";
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

  function submitSearch() {
    onSearch(searchInput.trim());
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

      <form
        onSubmit={handleSearch}
        className="mx-auto mb-6 hidden max-w-7xl gap-3 px-8 lg:flex"
      >
        <input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Buscar NFTs..."
          aria-label="Buscar NFTs"
          className="w-full rounded-lg border border-kurio-border bg-kurio-surface px-4 py-3 text-kurio-text outline-none focus:border-kurio-primary"
        />

        <Button
          type="submit"
          className="bg-kurio-primary text-kurio-background hover:bg-kurio-primary-hover"
        >
          Buscar
        </Button>
      </form>
    </>
  );
}