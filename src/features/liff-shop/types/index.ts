export interface ShopProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  stockQty: number;
  isActive: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  qty: number;
}

export type ShopOrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

export interface ShopOrderItem {
  id: string;
  productId: string;
  nameSnapshot: string;
  priceSnapshot: number;
  qty: number;
}

export interface ShopOrder {
  id: string;
  orderNumber: string;
  status: ShopOrderStatus;
  totalAmount: number;
  qrPayload: string | null;
  qrCodeDataUrl?: string;
  paidAt: string | null;
  shippedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  items: ShopOrderItem[];
}

export interface CreateOrderResult {
  order: ShopOrder;
  qrCodeDataUrl: string;
}

export interface MemberStatus {
  userType: "Guest" | "Member";
  phone?: string | null;
}
