import { API_ENDPOINTS } from "@/constants/api";
import {
  CreateOrderResult,
  MemberStatus,
  ShopOrder,
  ShopProduct,
} from "../types";

async function readErrorMessage(response: Response): Promise<string> {
  const data = await response.json().catch(() => ({}));
  if (Array.isArray(data.message)) {
    return data.message.join(", ");
  }
  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }
  return `Request failed (${response.status})`;
}

export async function fetchShopProducts(): Promise<ShopProduct[]> {
  const response = await fetch(API_ENDPOINTS.PRODUCTS.LIST, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}

export async function fetchShopProduct(id: string): Promise<ShopProduct> {
  const response = await fetch(API_ENDPOINTS.PRODUCTS.DETAIL(id), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}

export async function fetchMemberStatus(
  lineUserId: string,
): Promise<MemberStatus> {
  const response = await fetch(API_ENDPOINTS.MEMBER_LOGIN.STATUS(lineUserId), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}

export async function createOrder(input: {
  lineUserId: string;
  items: { productId: string; qty: number }[];
}): Promise<CreateOrderResult> {
  const response = await fetch(API_ENDPOINTS.ORDERS.CREATE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}

export async function confirmPayment(
  orderId: string,
  lineUserId: string,
): Promise<ShopOrder> {
  const response = await fetch(API_ENDPOINTS.ORDERS.CONFIRM_PAYMENT(orderId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lineUserId }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}

export async function fetchOrderHistory(
  lineUserId: string,
): Promise<ShopOrder[]> {
  const response = await fetch(API_ENDPOINTS.ORDERS.HISTORY(lineUserId), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}

export async function fetchOrderDetail(
  orderId: string,
  lineUserId: string,
): Promise<ShopOrder> {
  const response = await fetch(
    API_ENDPOINTS.ORDERS.DETAIL(orderId, lineUserId),
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}
