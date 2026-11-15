import { authHandlers } from "./handlers/auth.handlers";
import { cartHandlers } from "./handlers/cart.handlers";
import { nftHandlers } from "./handlers/nft.handlers";
import { orderHandlers } from "./handlers/order.handlers";

export const handlers = [
  ...authHandlers,
  ...nftHandlers,
  ...cartHandlers,
  ...orderHandlers
];