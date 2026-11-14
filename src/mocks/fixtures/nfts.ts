import type { NFT } from "@/features/nft/types/nft.types";

export const initialNFTs: NFT[] = [
  {
    id: "nft-042",
    name: "Emerald Ape #042",
    description:
      "Um colecionável digital exclusivo da coleção Kurio Apes.",
    price: "1.19",
    currency: "ETH",
    image: "/assets/nfts/emerald-ape.png",
    collection: "Kurio Apes",
    category: "Arte Digital",
    network: "Ethereum",
    availableQuantity: 50,
    version: 1,
  },
  {
    id: "nft-118",
    name: "Cosmic Bloom #118",
    description:
      "Uma obra digital inspirada no universo e em suas cores.",
    price: "1.29",
    currency: "ETH",
    image: "/assets/nfts/cosmic-bloom.png",
    collection: "Cosmic Collection",
    category: "Arte Digital",
    network: "Ethereum",
    availableQuantity: 10,
    version: 1,
  },
  {
    id: "nft-256",
    name: "Violet Nomad #256",
    description:
      "Uma peça digital exclusiva para colecionadores.",
    price: "0.89",
    currency: "ETH",
    image: "/assets/nfts/violet-nomad.png",
    collection: "Digital Nomads",
    category: "Colecionáveis",
    network: "Ethereum",
    availableQuantity: 25,
    version: 1,
  },
];