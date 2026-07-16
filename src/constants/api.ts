/**
 * API Endpoints Constants
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
  },
  LINE: {
    VERIFY: `${API_BASE_URL}/api/v1/line/verify`,
  },
} as const;
