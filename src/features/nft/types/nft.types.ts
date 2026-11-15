export type NFTTab = "all" | "new" | "trending";

export interface NFT {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: "ETH";
  image: string;
  collection: string;
  category: string;
  network: string;
  availableQuantity: number;
  version: number;

  createdAt: string;
  popularityScore: number;
}

export type NFTSort =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name-asc";

export interface NFTFilters {
  search?: string;
  category?: string;
  collection?: string;
  sort?: NFTSort;
  tab?: NFTTab;
  page?: number;
  limit?: number;
}

export interface NFTListResponse {
  data: NFT[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}