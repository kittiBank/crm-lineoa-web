import { API_ENDPOINTS } from "@/constants/api";
import { getToken } from "@/lib/auth";
import {
  CreateRichMenuPayload,
  CreateRichMenuResponse,
  RichMenuDetail,
  RichMenuRecord,
} from "../types";

export async function fetchRichMenus(): Promise<RichMenuRecord[]> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(API_ENDPOINTS.RICH_MENU.LIST, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch rich menus");
  }

  return response.json();
}

export async function fetchRichMenuById(id: string): Promise<RichMenuDetail> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(API_ENDPOINTS.RICH_MENU.DETAIL(id), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch rich menu");
  }

  return response.json();
}

export async function deleteRichMenu(id: string): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(API_ENDPOINTS.RICH_MENU.DETAIL(id), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to delete rich menu");
  }
}

export async function createRichMenu(
  payload: CreateRichMenuPayload,
): Promise<CreateRichMenuResponse> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("menuType", payload.menuType);
  formData.append("chatBarText", payload.chatBarText);
  formData.append("layoutId", payload.layoutId);
  formData.append("areas", JSON.stringify(payload.areas));
  formData.append("image", payload.image);

  const response = await fetch(API_ENDPOINTS.RICH_MENU.CREATE, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "Failed to create rich menu",
    );
  }

  return response.json();
}

export async function applyMemberRichMenu(
  richMenuId: string,
): Promise<{ linkedCount: number }> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(
    API_ENDPOINTS.RICH_MENU.APPLY_MEMBER(richMenuId),
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to apply member rich menu");
  }

  return response.json();
}
