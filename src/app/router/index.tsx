import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";

import HomePage from "@/pages/HomePage";
import NFTDetailsPage from "@/pages/NFTDetailsPage";
import NotFoundPage from "@/pages/NotFoundPage";

import type {
  NFTFilters,
  NFTSort,
  NFTTab,
} from "@/features/nft/types/nft.types";

const validSortOptions: NFTSort[] = [
  "newest",
  "price-asc",
  "price-desc",
  "name-asc",
];

const validTabOptions: NFTTab[] = [
  "all",
  "new",
  "trending",
];

function parsePositiveInteger(
  value: unknown,
  fallback: number,
): number {
  const parsed = Number(value);

  if (
    value === undefined ||
    value === null ||
    value === "" ||
    !Number.isSafeInteger(parsed) ||
    parsed < 1
  ) {
    return fallback;
  }

  return parsed;
}

function validateNFTSearch(
  search: Record<string, unknown>,
): NFTFilters {
  const requestedSort = search.sort;

  const sort: NFTSort =
    typeof requestedSort === "string" &&
    validSortOptions.includes(requestedSort as NFTSort)
      ? (requestedSort as NFTSort)
      : "newest";

  const requestedTab = search.tab;

  const tab: NFTTab =
    typeof requestedTab === "string" &&
    validTabOptions.includes(requestedTab as NFTTab)
      ? (requestedTab as NFTTab)
      : "all";

  return {
    search:
      typeof search.search === "string"
        ? search.search
        : "",

    category:
      typeof search.category === "string"
        ? search.category
        : "",

    collection:
      typeof search.collection === "string"
        ? search.collection
        : "",

    sort,
    tab,

    page: parsePositiveInteger(search.page, 1),

    limit: 6,
  };
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: NotFoundPage,
});

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
  validateSearch: validateNFTSearch,
});

export const nftDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nft/$nftId",
  component: NFTDetailsPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  nftDetailsRoute,
]);

export const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}