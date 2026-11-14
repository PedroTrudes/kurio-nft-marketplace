export type OrderStatus = "confirmed";

export interface OrderItem {
  nftId: string;
  name: string;
  image: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  currency: "ETH";
}

export interface Order {
  id: string;
  status: OrderStatus;
  items: OrderItem[];
  totalItems: number;
  subtotal: string;
  discount: string;
  networkFee: string;
  totalPrice: string;
  currency: "ETH";
  createdAt: string;
}

export interface CreateOrderItemInput {
  nftId: string;
  quantity: number;
}

export interface CreateOrderInput {
  idempotencyKey: string;
  items: CreateOrderItemInput[];
}

export interface OrderError {
  message: string;
}