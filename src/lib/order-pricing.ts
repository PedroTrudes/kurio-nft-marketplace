export const NETWORK_FEE = "0.01600000";

const ETH_DECIMALS = 8;
const ETH_FACTOR = 10 ** ETH_DECIMALS;

function toUnits(value: string): number {
  const [whole = "0", fraction = ""] = value.split(".");

  const normalizedFraction = fraction
    .padEnd(ETH_DECIMALS, "0")
    .slice(0, ETH_DECIMALS);

  return Number(whole) * ETH_FACTOR + Number(normalizedFraction);
}

function fromUnits(units: number): string {
  return (units / ETH_FACTOR).toFixed(ETH_DECIMALS);
}

export interface OrderPricing {
  subtotal: string;
  discount: string;
  networkFee: string;
  totalPrice: string;
}

export function calculateOrderPricing(
  subtotal: string,
): OrderPricing {
  const subtotalUnits = toUnits(subtotal);
  const networkFeeUnits = toUnits(NETWORK_FEE);

  const totalUnits = subtotalUnits + networkFeeUnits;

  return {
    subtotal,
    discount: "0.00000000",
    networkFee: NETWORK_FEE,
    totalPrice: fromUnits(totalUnits),
  };
}