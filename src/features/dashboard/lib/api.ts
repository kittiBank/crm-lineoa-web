import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import {
  BROADCAST_STATUS_COLORS,
  BroadcastStatusData,
  DashboardOverview,
  DashboardPeriod,
} from "../types";

const DEDUPE_WINDOW_MS = 1500;

const resultCache = new Map<
  DashboardPeriod,
  { at: number; data: DashboardOverview }
>();
const inflight = new Map<DashboardPeriod, Promise<DashboardOverview>>();

function withStatusColors(
  data: Omit<DashboardOverview, "broadcastStatus"> & {
    broadcastStatus: Array<Omit<BroadcastStatusData, "fill">>;
  },
): DashboardOverview {
  return {
    ...data,
    broadcastStatus: data.broadcastStatus.map((item) => ({
      ...item,
      fill: BROADCAST_STATUS_COLORS[item.name] ?? "#9ca3af",
    })),
  };
}

async function requestDashboardOverview(
  period: DashboardPeriod,
): Promise<DashboardOverview> {
  const url = `${API_ENDPOINTS.DASHBOARD.OVERVIEW}?period=${period}`;
  const response = await fetch(url, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await assertOkResponse(response, "Failed to fetch dashboard");

  const data = (await response.json()) as Omit<
    DashboardOverview,
    "broadcastStatus"
  > & {
    broadcastStatus: Array<Omit<BroadcastStatusData, "fill">>;
  };

  return withStatusColors(data);
}

export async function fetchDashboardOverview(
  period: DashboardPeriod = "today",
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
