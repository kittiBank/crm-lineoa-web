import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import { uploadTemplateImage } from "@/features/templates/lib/api";
import { RichMessageBlock, RichMessageRecord } from "../types";

// Rich messages are persisted as MessageTemplate rows (type: "imagemap") so
// they ride the same broadcast/auto-message wiring — list/detail just filter
// the shared /templates endpoints down to that type.
type TemplateResponse = RichMessageRecord & { type: string };

export const RICH_MESSAGE_CATEGORY = "Rich Message";

export interface RichMessagePayload {
  name: string;
  description?: string;
  isActive?: boolean;
  messages: [RichMessageBlock];
}

export async function fetchRichMessages(): Promise<RichMessageRecord[]> {
  const response = await fetch(API_ENDPOINTS.TEMPLATES.LIST, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await assertOkResponse(response, "Failed to fetch rich messages");

  const templates: TemplateResponse[] = await response.json();
  return templates.filter((template) => template.type === "imagemap");
}

export async function fetchRichMessageById(
  id: string,
): Promise<RichMessageRecord> {
  const response = await fetch(API_ENDPOINTS.TEMPLATES.DETAIL(id), {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await assertOkResponse(response, "Failed to fetch rich message");

  return response.json();
}

export async function createRichMessage(
  payload: RichMessagePayload,
): Promise<RichMessageRecord> {
  const response = await fetch(API_ENDPOINTS.TEMPLATES.CREATE, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ ...payload, category: RICH_MESSAGE_CATEGORY }),
  });

  await assertOkResponse(response, "Failed to create rich message");

  return response.json();
}

export async function updateRichMessage(
  id: string,
  payload: RichMessagePayload,
): Promise<RichMessageRecord> {
  const response = await fetch(API_ENDPOINTS.TEMPLATES.DETAIL(id), {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ ...payload, category: RICH_MESSAGE_CATEGORY }),
  });

  await assertOkResponse(response, "Failed to update rich message");

  return response.json();
}

export async function deleteRichMessage(id: string): Promise<void> {
  const response = await fetch(API_ENDPOINTS.TEMPLATES.DETAIL(id), {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await assertOkResponse(response, "Failed to delete rich message");
}

// Rich message images upload through the same endpoint generic templates use.
export const uploadRichMessageImage = uploadTemplateImage;
