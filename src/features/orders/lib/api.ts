import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import {
  dedupeAsync,
  invalidateDedupe,
  REMOUNT_DEDUPE_TTL_MS,
} from "@/lib/dedupe-async";
import { Order, OrderStatus } from "../types";

export async function fetchOrdersAdmin(options?: {
  status?: OrderStatus | "all";
  force?: boolean;
}): Promise<Order[]> {
  const status = options?.status && options.status !== "all" ? options.status : undefined;

  return dedupeAsync(
    `orders:admin:list:${status ?? "all"}`,
    async () => {
      const url = status
        ? `${API_ENDPOINTS.ORDERS.ADMIN_LIST}?status=${status}`
        : API_ENDPOINTS.ORDERS.ADMIN_LIST;

      const response = await fetch(url, {
        headers: getAuthHeaders(),
        cache: "no-store",
      });

      await assertOkResponse(response, "Failed to fetch orders");

      return response.json();
    },
    { ttlMs: REMOUNT_DEDUPE_TTL_MS, force: options?.force },
  );
}

export async function fetchOrderById(id: string): Promise<Order> {
  return dedupeAsync(
    `orders:${id}`,
    async () => {
      const response = await fetch(API_ENDPOINTS.ORDERS.ADMIN_DETAIL(id), {
        headers: getAuthHeaders(),
        cache: "no-store",
      });

      await assertOkResponse(response, "Failed to fetch order");

      return response.json();
    },
    { ttlMs: REMOUNT_DEDUPE_TTL_MS },
  );
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order> {
  const response = await fetch(API_ENDPOINTS.ORDERS.ADMIN_UPDATE_STATUS(id), {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  await assertOkResponse(response, "Failed to update order status");

  invalidateDedupe(`orders:${id}`);
  invalidateDedupe("orders:admin:list:all");
  invalidateDedupe("orders:admin:list:PAID");
  invalidateDedupe("orders:admin:list:SHIPPED");
  invalidateDedupe("orders:admin:list:COMPLETED");
  invalidateDedupe("orders:admin:list:CANCELLED");
  invalidateDedupe("orders:admin:list:PENDING_PAYMENT");
  return response.json();
}
