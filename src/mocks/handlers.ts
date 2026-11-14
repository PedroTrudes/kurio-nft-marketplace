import { cartHandlers } from "./handlers/cart.handlers";
import { nftHandlers } from "./handlers/nft.handlers";
import { orderHandlers } from "./handlers/order.handlers";

export const handlers = [
  ...nftHandlers,
  ...cartHandlers,
  ...orderHandlers
];