import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import { CreateMessageTemplatePayload, MessageTemplate } from "../types";

export async function fetchTemplates(): Promise<MessageTemplate[]> {
  const response = await fetch(API_ENDPOINTS.TEMPLATES.LIST, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await assertOkResponse(response, "Failed to fetch templates");

  return response.json();
}

export async function fetchTemplateById(id: string): Promise<MessageTemplate> {
  const response = await fetch(API_ENDPOINTS.TEMPLATES.DETAIL(id), {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await assertOkResponse(response, "Failed to fetch template");

  return response.json();
}

export async function createTemplate(
  payload: CreateMessageTemplatePayload,
): Promise<MessageTemplate> {
  const response = await fetch(API_ENDPOINTS.TEMPLATES.CREATE, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  await assertOkResponse(response, "Failed to create template");

  return response.json();
}

export async function updateTemplate(
  id: string,
  payload: Partial<CreateMessageTemplatePayload>,
): Promise<MessageTemplate> {
  const response = await fetch(API_ENDPOINTS.TEMPLATES.DETAIL(id), {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  await assertOkResponse(response, "Failed to update template");

  return response.json();
}

export async function deleteTemplate(id: string): Promise<void> {
  const response = await fetch(API_ENDPOINTS.TEMPLATES.DETAIL(id), {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await assertOkResponse(response, "Failed to delete template");
}
