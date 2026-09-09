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
    ACCOUNT: `${API_BASE_URL}/api/v1/line/account`,
    MESSAGE_QUOTA: `${API_BASE_URL}/api/v1/line/message-quota`,
    USERS: `${API_BASE_URL}/api/v1/line/users`,
  },
  TEMPLATES: {
    LIST: `${API_BASE_URL}/api/v1/templates`,
    CREATE: `${API_BASE_URL}/api/v1/templates`,
    MEDIA: `${API_BASE_URL}/api/v1/templates/media`,
    MEDIA_VIDEO: `${API_BASE_URL}/api/v1/templates/media/video`,
    MERGE_TAGS: `${API_BASE_URL}/api/v1/templates/merge-tags`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/v1/templates/${id}`,
  },
  RICH_MENU: {
    LIST: `${API_BASE_URL}/api/v1/rich-menus`,
    CREATE: `${API_BASE_URL}/api/v1/rich-menus`,
    LAYOUTS: `${API_BASE_URL}/api/v1/rich-menus/layouts`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/v1/rich-menus/${id}`,
    APPLY_MEMBER: (id: string) =>
      `${API_BASE_URL}/api/v1/rich-menus/${id}/apply-member`,
  },
  BROADCASTS: {
    LIST: `${API_BASE_URL}/api/v1/broadcasts`,
    CREATE: `${API_BASE_URL}/api/v1/broadcasts`,
    AUDIENCES: `${API_BASE_URL}/api/v1/broadcasts/audiences`,
    STATS: `${API_BASE_URL}/api/v1/broadcasts/stats`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/v1/broadcasts/${id}`,
    SEND: (id: string) => `${API_BASE_URL}/api/v1/broadcasts/${id}/send`,
  },
  AUTO_MESSAGES: {
    LIST: `${API_BASE_URL}/api/v1/auto-messages`,
    CREATE: `${API_BASE_URL}/api/v1/auto-messages`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/v1/auto-messages/${id}`,
  },
  DASHBOARD: {
    OVERVIEW: `${API_BASE_URL}/api/v1/dashboard`,
  },
  AUDIENCES: {
    LIST: `${API_BASE_URL}/api/v1/audiences`,
    CREATE: `${API_BASE_URL}/api/v1/audiences`,
    ESTIMATE: `${API_BASE_URL}/api/v1/audiences/estimate`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/v1/audiences/${id}`,
  },
  MEMBER_LOGIN: {
    REQUEST_OTP: `${API_BASE_URL}/api/v1/member-login/otp/request`,
    VERIFY_OTP: `${API_BASE_URL}/api/v1/member-login/otp/verify`,
  },
} as const;
