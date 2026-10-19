import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import { NotificationPage } from "../types";

async function request<T>(
  url: string,
  fallbackMessage: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await assertOkResponse(response, fallbackMessage);
  return response.json();
}

export function fetchNotifications(cursor?: string): Promise<NotificationPage> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  return request(
    `${API_ENDPOINTS.NOTIFICATIONS.LIST}${query}`,
    "Failed to load notifications",
  );
}

export function fetchUnreadNotificationCount(): Promise<{ unread: number }> {
  return request(
    API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT,
    "Failed to load notification count",
  );
}

export function markNotificationRead(id: string): Promise<{ unread: number }> {
  return request(
    API_ENDPOINTS.NOTIFICATIONS.READ(id),
    "Failed to mark notification as read",
    { method: "PATCH" },
  );
}

export function markAllNotificationsRead(): Promise<{ unread: number }> {
  return request(
    API_ENDPOINTS.NOTIFICATIONS.READ_ALL,
    "Failed to mark notifications as read",
    { method: "POST" },
  );
}
