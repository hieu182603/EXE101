export enum OrderStatus {
  PENDING = "PENDING",
  ASSIGNED = "ASSIGNED",
  CONFIRMED = "CONFIRMED",
  SHIPPING = "SHIPPING",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  EXTERNAL = "EXTERNAL",
}

export interface OrderDetail {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    url: string;
    price: number;
  };
}

export interface Order {
  id: string;
  customer: {
    id: string;
    username: string;
  };
  shipper?: {
    id: string;
    username: string;
  };
  orderDate: Date;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  note?: string;
  cancelReason?: string;
  orderDetails: OrderDetail[];
}

export interface OrderStatistics {
  total: number;
  pending: number;
  processing: number;
  shipping: number;
  delivered: number;
  cancelled: number;
}
