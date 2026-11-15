import type { NFTTab } from "@/features/nft/types/nft.types";

interface CatalogTabsProps {
  activeTab: NFTTab;
  onTabChange: (tab: NFTTab) => void;
}

const tabs: {
  label: string;
  value: NFTTab;
}[] = [
  {
    label: "Todos os NFTs",
    value: "all",
  },
  {
    label: "Novos lançamentos",
    value: "new",
  },
  {
    label: "Em alta",
    value: "trending",
  },
];

export default function CatalogTabs({
  activeTab,
  onTabChange,
}: CatalogTabsProps) {
  return (
    <nav
      aria-label="Categorias do catálogo"
      className="mb-8 w-full overflow-x-auto"
    >
      <div className="flex min-w-max items-center gap-6 border-b border-kurio-border md:gap-10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange(tab.value)}
              aria-current={isActive ? "page" : undefined}
              className={`
                relative whitespace-nowrap pb-4 text-xs font-semibold
                transition-colors duration-200
                sm:text-sm
                ${
                  isActive
                    ? "text-kurio-primary"
                    : "text-kurio-text-muted hover:text-kurio-text"
                }
              `}
            >
              {tab.label}

              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-kurio-primary"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}