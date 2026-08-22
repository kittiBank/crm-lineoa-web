import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import {
  LineAccountResponse,
  VerifyLineResponse,
} from "../types";

let lineAccountRequest: Promise<LineAccountResponse> | null = null;

export function fetchLineAccount(): Promise<LineAccountResponse> {
  if (!lineAccountRequest) {
    lineAccountRequest = (async () => {
      try {
        const response = await fetch(API_ENDPOINTS.LINE.ACCOUNT, {
          headers: getAuthHeaders(),
          cache: "no-store",
        });

        await assertOkResponse(response, "Failed to load LINE account");
        return (await response.json()) as LineAccountResponse;
      } catch (error) {
        lineAccountRequest = null;
        throw error;
      }
    })();
  }

  return lineAccountRequest;
}

export function invalidateLineAccountCache() {
  lineAccountRequest = null;
}

export async function testSavedLineAccount(): Promise<VerifyLineResponse> {
  invalidateLineAccountCache();

  const response = await fetch(API_ENDPOINTS.LINE.ACCOUNT_TEST, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({}),
  });

  await assertOkResponse(response, "Connection failed");
  return response.json();
}

export async function verifyLineAccount(payload: {
  channelAccessToken: string;
  channelSecret: string;
  name?: string;
  saveToDb: boolean;
}): Promise<VerifyLineResponse> {
  if (payload.saveToDb) {
    invalidateLineAccountCache();
  }

  const response = await fetch(API_ENDPOINTS.LINE.VERIFY, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  await assertOkResponse(response, "Connection failed");
  return response.json();
}
