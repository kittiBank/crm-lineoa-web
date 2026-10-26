import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import { DashboardOverview, DashboardPeriod } from "../types";

const DEDUPE_WINDOW_MS = 1500;

const resultCache = new Map<
  DashboardPeriod,
  { at: number; data: DashboardOverview }
>();
const inflight = new Map<DashboardPeriod, Promise<DashboardOverview>>();

async function requestDashboardOverview(
  period: DashboardPeriod,
): Promise<DashboardOverview> {
  const url = `${API_ENDPOINTS.DASHBOARD.OVERVIEW}?period=${period}`;
  const response = await fetch(url, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await assertOkResponse(response, "Failed to fetch dashboard");

  return (await response.json()) as DashboardOverview;
}

export async function fetchDashboardOverview(
  period: DashboardPeriod,
): Promise<DashboardOverview> {
  const cached = resultCache.get(period);
  if (cached && Date.now() - cached.at < DEDUPE_WINDOW_MS) {
    return cached.data;
  }

  const pending = inflight.get(period);
  if (pending) {
    return pending;
  }

  const request = requestDashboardOverview(period)
    .then((data) => {
      resultCache.set(period, { at: Date.now(), data });
      return data;
    })
    .finally(() => {
      inflight.delete(period);
    });

  inflight.set(period, request);
  return request;
}
