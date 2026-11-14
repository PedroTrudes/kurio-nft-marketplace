import { cartHandlers } from "./handlers/cart.handlers";
import { nftHandlers } from "./handlers/nft.handlers";

export const handlers = [
  ...nftHandlers,
  ...cartHandlers,
];