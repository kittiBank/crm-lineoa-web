import { API_ENDPOINTS } from "@/constants/api";
import { MemberCardResponse } from "../types";

export async function fetchMemberCard(
  lineUserId: string,
): Promise<MemberCardResponse> {
  const response = await fetch(API_ENDPOINTS.MEMBER_TIER(lineUserId), {
    cache: "no-store",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      typeof data.message === "string"
        ? data.message
        : `Request failed (${response.status})`,
    );
  }

  return response.json();
}

export function formatBaht(value: number): string {
  return `฿${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}
