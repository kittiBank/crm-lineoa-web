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
    USERS: `${API_BASE_URL}/api/v1/line/users`,
  },
  TEMPLATES: {
    LIST: `${API_BASE_URL}/api/v1/templates`,
    CREATE: `${API_BASE_URL}/api/v1/templates`,
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
} as const;
