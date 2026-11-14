import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";

import HomePage from "@/pages/HomePage";
import NotFoundPage from "@/pages/NotFoundPage";

import type {
  NFTFilters,
  NFTSort,
} from "@/features/nft/types/nft.types";

const validSortOptions: NFTSort[] = [
  "newest",
  "price-asc",
  "price-desc",
  "name-asc",
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

const routeTree = rootRoute.addChildren([
  homeRoute,
]);

export const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}