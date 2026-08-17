import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import {
  BROADCAST_STATUS_COLORS,
  BroadcastStatusData,
  DashboardOverview,
  DashboardTrendDays,
} from "../types";

export async function fetchDashboardOverview(
  days: DashboardTrendDays = 7,
): Promise<DashboardOverview> {
  const url = `${API_ENDPOINTS.DASHBOARD.OVERVIEW}?days=${days}`;
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

  return {
    ...data,
    broadcastStatus: data.broadcastStatus.map((item) => ({
      ...item,
      fill: BROADCAST_STATUS_COLORS[item.name] ?? "#9ca3af",
    })),
  };
}
