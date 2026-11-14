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
}

export interface NFTListResponse {
  data: NFT[];
  total: number;
}