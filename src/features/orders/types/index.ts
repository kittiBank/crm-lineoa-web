export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  nameSnapshot: string;
  priceSnapshot: number;
  qty: number;
}

export interface OrderBuyer {
  id: string;
  displayName: string | null;
  pictureUrl: string | null;
  phone: string | null;
}

export interface Order {
  id: string;
  userId: string;
  lineUserId: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  qrPayload: string | null;
  paidAt: string | null;
  shippedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  lineUser?: OrderBuyer;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pending Payment",
  PAID: "Paid",
  SHIPPED: "Shipped",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ADMIN_SETTABLE_STATUSES: OrderStatus[] = [
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
];

export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: [],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};
