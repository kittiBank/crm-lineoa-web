import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import {
  dedupeAsync,
  invalidateDedupe,
  REMOUNT_DEDUPE_TTL_MS,
} from "@/lib/dedupe-async";
import {
  AutoMessage,
  CreateAutoMessagePayload,
  UpdateAutoMessagePayload,
} from "../types";

export async function fetchAutoMessages(options?: {
  force?: boolean;
}): Promise<AutoMessage[]> {
  return dedupeAsync(
    "auto-messages:list",
    async () => {
      const response = await fetch(API_ENDPOINTS.AUTO_MESSAGES.LIST, {
        headers: getAuthHeaders(),
        cache: "no-store",
      });

      await assertOkResponse(response, "Failed to fetch auto messages");

      return response.json();
    },
    { ttlMs: REMOUNT_DEDUPE_TTL_MS, force: options?.force },
  );
}

export async function fetchAutoMessageById(id: string): Promise<AutoMessage> {
  return dedupeAsync(
    `auto-messages:${id}`,
    async () => {
      const response = await fetch(API_ENDPOINTS.AUTO_MESSAGES.DETAIL(id), {
        headers: getAuthHeaders(),
        cache: "no-store",
      });

      await assertOkResponse(response, "Failed to fetch auto message");

      return response.json();
    },
    { ttlMs: REMOUNT_DEDUPE_TTL_MS },
  );
}

export async function createAutoMessage(
  payload: CreateAutoMessagePayload,
): Promise<AutoMessage> {
  const response = await fetch(API_ENDPOINTS.AUTO_MESSAGES.CREATE, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  await assertOkResponse(response, "Failed to create auto message");

  invalidateDedupe("auto-messages:list");
  return response.json();
}

export async function updateAutoMessage(
  id: string,
  payload: UpdateAutoMessagePayload,
): Promise<AutoMessage> {
  const response = await fetch(API_ENDPOINTS.AUTO_MESSAGES.DETAIL(id), {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  await assertOkResponse(response, "Failed to update auto message");

  invalidateDedupe("auto-messages:list");
  invalidateDedupe(`auto-messages:${id}`);
  return response.json();
}

export async function deleteAutoMessage(id: string): Promise<void> {
  const response = await fetch(API_ENDPOINTS.AUTO_MESSAGES.DETAIL(id), {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await assertOkResponse(response, "Failed to delete auto message");
  invalidateDedupe("auto-messages:list");
  invalidateDedupe(`auto-messages:${id}`);
}
