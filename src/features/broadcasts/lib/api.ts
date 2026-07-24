import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import {
  BroadcastAudienceOption,
  BroadcastRecord,
  BroadcastStats,
  CreateBroadcastPayload,
  UpdateBroadcastPayload,
} from "../types";

export async function fetchBroadcastAudiences(): Promise<
  BroadcastAudienceOption[]
> {
  const response = await fetch(API_ENDPOINTS.BROADCASTS.AUDIENCES, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await assertOkResponse(response, "Failed to fetch audiences");

  return response.json();
}

export async function fetchBroadcasts(): Promise<BroadcastRecord[]> {
  const response = await fetch(API_ENDPOINTS.BROADCASTS.LIST, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await assertOkResponse(response, "Failed to fetch broadcasts");

  return response.json();
}

export async function fetchBroadcastStats(): Promise<BroadcastStats> {
  const response = await fetch(API_ENDPOINTS.BROADCASTS.STATS, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await assertOkResponse(response, "Failed to fetch broadcast stats");

  return response.json();
}

export async function fetchBroadcastById(id: string): Promise<BroadcastRecord> {
  const response = await fetch(API_ENDPOINTS.BROADCASTS.DETAIL(id), {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await assertOkResponse(response, "Failed to fetch broadcast");

  return response.json();
}

export async function createBroadcast(
  payload: CreateBroadcastPayload,
): Promise<BroadcastRecord> {
  const response = await fetch(API_ENDPOINTS.BROADCASTS.CREATE, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  await assertOkResponse(response, "Failed to create broadcast");

  return response.json();
}

export async function updateBroadcast(
  id: string,
  payload: UpdateBroadcastPayload,
): Promise<BroadcastRecord> {
  const response = await fetch(API_ENDPOINTS.BROADCASTS.DETAIL(id), {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  await assertOkResponse(response, "Failed to update broadcast");

  return response.json();
}

export async function sendBroadcastNow(id: string): Promise<BroadcastRecord> {
  const response = await fetch(API_ENDPOINTS.BROADCASTS.SEND(id), {
    method: "POST",
    headers: getAuthHeaders(),
  });

  await assertOkResponse(response, "Failed to send broadcast");

  return response.json();
}

export async function deleteBroadcast(id: string): Promise<void> {
  const response = await fetch(API_ENDPOINTS.BROADCASTS.DETAIL(id), {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await assertOkResponse(response, "Failed to delete broadcast");
}
