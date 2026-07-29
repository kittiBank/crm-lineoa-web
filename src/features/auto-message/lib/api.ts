import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import {
  AutoMessage,
  CreateAutoMessagePayload,
  UpdateAutoMessagePayload,
} from "../types";

export async function fetchAutoMessages(): Promise<AutoMessage[]> {
  const response = await fetch(API_ENDPOINTS.AUTO_MESSAGES.LIST, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await assertOkResponse(response, "Failed to fetch auto messages");

  return response.json();
}

export async function fetchAutoMessageById(id: string): Promise<AutoMessage> {
  const response = await fetch(API_ENDPOINTS.AUTO_MESSAGES.DETAIL(id), {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await assertOkResponse(response, "Failed to fetch auto message");

  return response.json();
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

  return response.json();
}

export async function deleteAutoMessage(id: string): Promise<void> {
  const response = await fetch(API_ENDPOINTS.AUTO_MESSAGES.DETAIL(id), {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await assertOkResponse(response, "Failed to delete auto message");
}
