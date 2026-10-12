import { API_ENDPOINTS } from "@/constants/api";

/**
 * Public click capture for the LIFF redirect page. Resolves to the destination
 * URL, or null when the API is unreachable / the link is unknown.
 */
export async function recordTrackedClick(payload: {
  linkId: string;
  idToken?: string;
  lineUserId?: string;
}): Promise<string | null> {
  try {
    const response = await fetch(API_ENDPOINTS.BROADCASTS.TRACKING_CLICK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { url?: string };
    return data.url ?? null;
  } catch {
    return null;
  }
}
