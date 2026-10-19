/**
 * API Endpoints Constants
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
    PROFILE: `${API_BASE_URL}/api/v1/auth/profile`,
  },
  LINE: {
    ACCOUNT: `${API_BASE_URL}/api/v1/line/account`,
    MESSAGE_QUOTA: `${API_BASE_URL}/api/v1/line/message-quota`,
    USERS: `${API_BASE_URL}/api/v1/line/users`,
    USER_TIER: (id: string) =>
      `${API_BASE_URL}/api/v1/line/users/${id}/tier`,
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
    TRACKING: (id: string) =>
      `${API_BASE_URL}/api/v1/broadcasts/${id}/tracking`,
    TRACKING_RECIPIENTS: (id: string, query: string) =>
      `${API_BASE_URL}/api/v1/broadcasts/${id}/tracking/recipients?${query}`,
    TRACKING_SYNC: (id: string) =>
      `${API_BASE_URL}/api/v1/broadcasts/${id}/tracking/sync`,
    /** Public — called from the LIFF tracked-link redirect page. */
    TRACKING_CLICK: `${API_BASE_URL}/api/v1/tracking/clicks`,
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
    PREVIEW: `${API_BASE_URL}/api/v1/audiences/preview`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/v1/audiences/${id}`,
  },
  INBOX: {
    CONVERSATIONS: `${API_BASE_URL}/api/v1/inbox/conversations`,
    CONVERSATION: (id: string) =>
      `${API_BASE_URL}/api/v1/inbox/conversations/${id}`,
    MESSAGES: (id: string) =>
      `${API_BASE_URL}/api/v1/inbox/conversations/${id}/messages`,
    READ: (id: string) =>
      `${API_BASE_URL}/api/v1/inbox/conversations/${id}/read`,
    SUMMARY: `${API_BASE_URL}/api/v1/inbox/summary`,
    AGENTS: `${API_BASE_URL}/api/v1/inbox/agents`,
  },
  NOTIFICATIONS: {
    LIST: `${API_BASE_URL}/api/v1/notifications`,
    UNREAD_COUNT: `${API_BASE_URL}/api/v1/notifications/unread-count`,
    READ: (id: string) => `${API_BASE_URL}/api/v1/notifications/${id}/read`,
    READ_ALL: `${API_BASE_URL}/api/v1/notifications/read-all`,
  },
  /** Server-Sent Events; open with a fetch-based reader (see lib/realtime). */
  REALTIME_STREAM: `${API_BASE_URL}/api/v1/realtime/stream`,
  AUDIENCE_IMPORTS: {
    JOBS: `${API_BASE_URL}/api/v1/audience-imports/jobs`,
    JOB: (id: string) => `${API_BASE_URL}/api/v1/audience-imports/jobs/${id}`,
    ROWS: (id: string) =>
      `${API_BASE_URL}/api/v1/audience-imports/jobs/${id}/rows`,
    RESULT: (id: string) =>
      `${API_BASE_URL}/api/v1/audience-imports/jobs/${id}/result`,
  },
  MEMBER_LOGIN: {
    REQUEST_OTP: `${API_BASE_URL}/api/v1/member-login/otp/request`,
    VERIFY_OTP: `${API_BASE_URL}/api/v1/member-login/otp/verify`,
    STATUS: (lineUserId: string) =>
      `${API_BASE_URL}/api/v1/member-login/status?lineUserId=${encodeURIComponent(lineUserId)}`,
  },
  MEMBER_TIER: (lineUserId: string) =>
    `${API_BASE_URL}/api/v1/member-tier?lineUserId=${encodeURIComponent(lineUserId)}`,
  PRODUCTS: {
    LIST: `${API_BASE_URL}/api/v1/products`,
    ADMIN_LIST: `${API_BASE_URL}/api/v1/products/admin`,
    ADMIN_DETAIL: (id: string) => `${API_BASE_URL}/api/v1/products/admin/${id}`,
    CREATE: `${API_BASE_URL}/api/v1/products`,
    MEDIA: `${API_BASE_URL}/api/v1/products/media`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/v1/products/${id}`,
  },
  ORDERS: {
    CREATE: `${API_BASE_URL}/api/v1/orders`,
    CONFIRM_PAYMENT: (id: string) =>
      `${API_BASE_URL}/api/v1/orders/${id}/confirm-payment`,
    HISTORY: (lineUserId: string) =>
      `${API_BASE_URL}/api/v1/orders?lineUserId=${encodeURIComponent(lineUserId)}`,
    DETAIL: (id: string, lineUserId: string) =>
      `${API_BASE_URL}/api/v1/orders/${id}?lineUserId=${encodeURIComponent(lineUserId)}`,
    ADMIN_LIST: `${API_BASE_URL}/api/v1/orders/admin`,
    ADMIN_DETAIL: (id: string) => `${API_BASE_URL}/api/v1/orders/admin/${id}`,
    ADMIN_UPDATE_STATUS: (id: string) =>
      `${API_BASE_URL}/api/v1/orders/admin/${id}/status`,
  },
} as const;
