import { API_ENDPOINTS } from "@/constants/api";
import { getToken } from "@/lib/auth";
import { FilterOptions, LineUser } from "../types";

export interface LineUsersResponse {
  data: LineUserApiItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LineUserApiItem {
  id: string;
  lineUserId: string;
  displayName: string;
  avatar?: string;
  userType: "Member" | "Guest";
  status: "Active" | "Blocked" | "Unfollowed";
  tags: string[];
  lastActive: string;
  dateAdded: string;
  followedDate?: string;
}

function mapApiUserToLineUser(user: LineUserApiItem): LineUser {
  return {
    id: user.id,
    lineUserId: user.lineUserId,
    displayName: user.displayName,
    avatar: user.avatar,
    userType: user.userType,
    status: user.status,
    tags: user.tags,
    lastActive: new Date(user.lastActive),
    dateAdded: new Date(user.dateAdded),
    followedDate: user.followedDate ? new Date(user.followedDate) : undefined,
  };
}

export async function fetchLineUsers(
  filters: FilterOptions,
  page: number,
  limit: number,
): Promise<{ users: LineUser[]; meta: LineUsersResponse["meta"] }> {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    searchType: "all",
    userType: filters.userType,
    status: filters.status,
  });

  if (filters.searchQuery) {
    params.set("search", filters.searchQuery);
  }

  if (filters.dateRange) {
    params.set("dateRange", filters.dateRange);
  }

  const response = await fetch(`${API_ENDPOINTS.LINE.USERS}?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch LINE users");
  }

  const result: LineUsersResponse = await response.json();

  return {
    users: result.data.map(mapApiUserToLineUser),
    meta: result.meta,
  };
}
