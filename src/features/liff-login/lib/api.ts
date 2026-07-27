import { API_ENDPOINTS } from "@/constants/api";
import type { RequestOtpResponse, VerifyOtpResponse } from "../types";

async function readErrorMessage(response: Response): Promise<string> {
  const data = await response.json().catch(() => ({}));
  if (Array.isArray(data.message)) {
    return data.message.join(", ");
  }
  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }
  return `Request failed (${response.status})`;
}

export async function requestOtp(input: {
  lineUserId: string;
  phone: string;
}): Promise<RequestOtpResponse> {
  const response = await fetch(API_ENDPOINTS.MEMBER_LOGIN.REQUEST_OTP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}

export async function verifyOtp(input: {
  lineUserId: string;
  phone: string;
  otp: string;
}): Promise<VerifyOtpResponse> {
  const response = await fetch(API_ENDPOINTS.MEMBER_LOGIN.VERIFY_OTP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}
