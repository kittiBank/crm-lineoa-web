import { API_ENDPOINTS } from "@/constants/api";
import { getToken } from "@/lib/auth";
import {
  CreateMessageTemplatePayload,
  MessageTemplate,
} from "../types";

async function authHeaders() {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function fetchTemplates(): Promise<MessageTemplate[]> {
  const response = await fetch(API_ENDPOINTS.TEMPLATES.LIST, {
    headers: await authHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch templates");
  }

  return response.json();
}

export async function fetchTemplateById(id: string): Promise<MessageTemplate> {
  const response = await fetch(API_ENDPOINTS.TEMPLATES.DETAIL(id), {
    headers: await authHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch template");
  }

  return response.json();
}

export async function createTemplate(
  payload: CreateMessageTemplatePayload,
): Promise<MessageTemplate> {
  const response = await fetch(API_ENDPOINTS.TEMPLATES.CREATE, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "Failed to create template",
    );
  }

  return response.json();
}

export async function updateTemplate(
  id: string,
  payload: Partial<CreateMessageTemplatePayload>,
): Promise<MessageTemplate> {
  const response = await fetch(API_ENDPOINTS.TEMPLATES.DETAIL(id), {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to update template");
  }

  return response.json();
}

export async function deleteTemplate(id: string): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(API_ENDPOINTS.TEMPLATES.DETAIL(id), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to delete template");
  }
}
