import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import { LineUserPointsResponse, MyPointsResponse } from "../types";

/** LIFF: no admin auth, scoped by the LINE platform user ID. */
export async function fetchMyPoints(
  lineUserId: string,
): Promise<MyPointsResponse> {
  const response = await fetch(API_ENDPOINTS.POINTS.ME(lineUserId), {
    cache: "no-store",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      typeof data.message === "string" ? data.message : "Failed to load points",
    );
  }

  return response.json();
}

export async function fetchLineUserPoints(
  lineUserRecordId: string,
): Promise<LineUserPointsResponse> {
  const response = await fetch(API_ENDPOINTS.POINTS.LINE_USER(lineUserRecordId), {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await assertOkResponse(response, "Failed to load points");
  return response.json();
}

export async function adjustLineUserPoints(
  lineUserRecordId: string,
  input: { points: number; note: string },
): Promise<LineUserPointsResponse> {
  const response = await fetch(API_ENDPOINTS.POINTS.ADJUST(lineUserRecordId), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });

  await assertOkResponse(response, "Failed to adjust points");
  return response.json();
}
