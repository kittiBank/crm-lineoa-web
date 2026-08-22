import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import {
  LineAccountResponse,
  VerifyLineResponse,
} from "../types";

export async function fetchLineAccount(): Promise<LineAccountResponse> {
  const response = await fetch(API_ENDPOINTS.LINE.ACCOUNT, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await assertOkResponse(response, "Failed to load LINE account");
  return response.json();
}

export async function testSavedLineAccount(): Promise<VerifyLineResponse> {
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
  const response = await fetch(API_ENDPOINTS.LINE.VERIFY, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  await assertOkResponse(response, "Connection failed");
  return response.json();
}
