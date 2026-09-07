import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import {
  dedupeAsync,
  invalidateDedupe,
  REMOUNT_DEDUPE_TTL_MS,
} from "@/lib/dedupe-async";
import { getToken } from "@/lib/auth";
import { CreateMessageTemplatePayload, MessageTemplate } from "../types";

export async function fetchTemplates(options?: {
  force?: boolean;
}): Promise<MessageTemplate[]> {
  return dedupeAsync(
    "templates:list",
    async () => {
      const response = await fetch(API_ENDPOINTS.TEMPLATES.LIST, {
        headers: getAuthHeaders(),
        cache: "no-store",
      });

      await assertOkResponse(response, "Failed to fetch templates");

      return response.json();
    },
    { ttlMs: REMOUNT_DEDUPE_TTL_MS, force: options?.force },
  );
}

export async function uploadTemplateImage(
  file: File,
): Promise<{ url: string; displayUrl: string; key: string }> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(API_ENDPOINTS.TEMPLATES.MEDIA, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  await assertOkResponse(response, "Failed to upload image");

  return response.json();
}

export async function uploadTemplateVideo(
  file: File,
): Promise<{ url: string; displayUrl: string; key: string }> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  const formData = new FormData();
  formData.append("video", file);

  const response = await fetch(API_ENDPOINTS.TEMPLATES.MEDIA_VIDEO, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  await assertOkResponse(response, "Failed to upload video");

  return response.json();
}

export async function fetchTemplateById(id: string): Promise<MessageTemplate> {
  return dedupeAsync(
    `templates:${id}`,
    async () => {
      const response = await fetch(API_ENDPOINTS.TEMPLATES.DETAIL(id), {
        headers: getAuthHeaders(),
        cache: "no-store",
      });

      await assertOkResponse(response, "Failed to fetch template");

      return response.json();
    },
    { ttlMs: REMOUNT_DEDUPE_TTL_MS },
  );
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

  invalidateDedupe("templates:list");
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

  invalidateDedupe("templates:list");
  invalidateDedupe(`templates:${id}`);
  return response.json();
}

export async function deleteTemplate(id: string): Promise<void> {
  const response = await fetch(API_ENDPOINTS.TEMPLATES.DETAIL(id), {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await assertOkResponse(response, "Failed to delete template");
  invalidateDedupe("templates:list");
  invalidateDedupe(`templates:${id}`);
}
