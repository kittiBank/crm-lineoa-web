import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import {
  DashboardOverview,
  DashboardPeriod,
  DashboardUserFilters,
  DashboardUsers,
} from "../types";

const DEDUPE_WINDOW_MS = 1500;

const resultCache = new Map<string, { at: number; data: unknown }>();
const inflight = new Map<string, Promise<unknown>>();

/**
 * GET with a short dedupe window, so React strict-mode double effects and
 * quick tab switches share one request per URL.
 */
async function fetchDeduped<T>(url: string): Promise<T> {
  const cached = resultCache.get(url);
  if (cached && Date.now() - cached.at < DEDUPE_WINDOW_MS) {
    return cached.data as T;
  }

  const pending = inflight.get(url);
  if (pending) {
    return pending as Promise<T>;
  }

  const request = (async () => {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    await assertOkResponse(response, "Failed to fetch dashboard");
    const data = (await response.json()) as T;
    resultCache.set(url, { at: Date.now(), data });
    return data;
  })().finally(() => {
    inflight.delete(url);
  });

  inflight.set(url, request);
  return request;
}

export function fetchDashboardOverview(
  period: DashboardPeriod,
): Promise<DashboardOverview> {
  return fetchDeduped(`${API_ENDPOINTS.DASHBOARD.OVERVIEW}?period=${period}`);
}

export function fetchDashboardUsers(
  period: DashboardPeriod,
  filters: DashboardUserFilters,
): Promise<DashboardUsers> {
  const params = new URLSearchParams({ period });
  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }
  return fetchDeduped(`${API_ENDPOINTS.DASHBOARD.USERS}?${params}`);
}
