import * as XLSX from "xlsx";
import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import {
  BroadcastTrackingRecipient,
  BroadcastTrackingRecipientsResponse,
  BroadcastTrackingSummary,
  TrackingRecipientFilter,
  TrackingRecipientsQuery,
} from "../types/tracking";

const EXPORT_PAGE_SIZE = 1000;

export async function fetchBroadcastTracking(
  broadcastId: string,
): Promise<BroadcastTrackingSummary> {
  const response = await fetch(API_ENDPOINTS.BROADCASTS.TRACKING(broadcastId), {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await assertOkResponse(response, "Failed to fetch broadcast tracking");

  return response.json();
}

export async function fetchTrackingRecipients(
  broadcastId: string,
  query: TrackingRecipientsQuery,
): Promise<BroadcastTrackingRecipientsResponse> {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
    filter: query.filter,
  });
  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  const response = await fetch(
    API_ENDPOINTS.BROADCASTS.TRACKING_RECIPIENTS(
      broadcastId,
      params.toString(),
    ),
    {
      headers: getAuthHeaders(),
      cache: "no-store",
    },
  );

  await assertOkResponse(response, "Failed to fetch recipients");

  return response.json();
}

function formatExportDate(value: string | null): string {
  return value ? new Date(value).toLocaleString("en-GB") : "";
}

/** Downloads every recipient matching the filter/search as .xlsx. */
export async function exportTrackingRecipients(
  broadcastId: string,
  broadcastName: string,
  filter: TrackingRecipientFilter,
  search?: string,
): Promise<number> {
  const rows: BroadcastTrackingRecipient[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await fetchTrackingRecipients(broadcastId, {
      page,
      limit: EXPORT_PAGE_SIZE,
      filter,
      search,
    });
    rows.push(...result.data);
    totalPages = result.meta.totalPages;
    page += 1;
  } while (page <= totalPages);

  const sheet = XLSX.utils.json_to_sheet(
    rows.map((row) => ({
      "Display Name": row.displayName ?? "",
      "LINE User ID": row.lineUserId ?? "",
      "User Type": row.userType ?? "",
      "User Tier": row.userTier ?? "",
      Clicks: row.clickCount,
      "First Click": formatExportDate(row.firstClickedAt),
      "Last Click": formatExportDate(row.lastClickedAt),
    })),
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Recipients");

  const safeName = broadcastName
    .replace(/[^\p{L}\p{N}_-]+/gu, "-")
    .slice(0, 60);
  XLSX.writeFile(
    workbook,
    `broadcast-${safeName || broadcastId}-${filter}.xlsx`,
  );

  return rows.length;
}
