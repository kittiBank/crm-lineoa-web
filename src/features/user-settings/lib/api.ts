import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import { AdminUser, CreateUserInput, PaginatedUsers } from "../types";

/** Initial password the API gives new users (DEFAULT_USER_PASSWORD). */
export const DEFAULT_USER_PASSWORD = "123456@";

export async function fetchUsers(params: {
  page: number;
  limit: number;
}): Promise<PaginatedUsers> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  const response = await fetch(`${API_ENDPOINTS.ADMIN.USERS}?${query}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  await assertOkResponse(response, "Failed to load users");
  return (await response.json()) as PaginatedUsers;
}

export async function createUser(input: CreateUserInput): Promise<AdminUser> {
  const response = await fetch(API_ENDPOINTS.ADMIN.USERS, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });
  await assertOkResponse(response, "Failed to create user");
  return (await response.json()) as AdminUser;
}
