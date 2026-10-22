import { API_ENDPOINTS } from "@/constants/api";
import { AUTH_USER_KEY } from "@/lib/auth";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import { AdminLineAccount, LineAccountResponse } from "../types";

export const LINE_ACCOUNT_CACHE_TTL_MS = 5 * 60 * 1000;
export const LINE_ACCOUNT_CACHE_KEY = "crm.line-account.cache.v3";

type LineAccountCacheEntry = {
  data: LineAccountResponse;
  cachedAt: number;
  userKey: string;
};

let memoryCache: LineAccountCacheEntry | null = null;
let inflightRequest: Promise<LineAccountResponse> | null = null;

function getUserKey() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) {
      return "";
    }

    const user = JSON.parse(raw) as { id?: string; email?: string };
    return user.id || user.email || raw;
  } catch {
    return localStorage.getItem(AUTH_USER_KEY) ?? "";
  }
}

function isFresh(entry: LineAccountCacheEntry) {
  return (
    entry.userKey === getUserKey() &&
    Date.now() - entry.cachedAt < LINE_ACCOUNT_CACHE_TTL_MS
  );
}

function readStoredCache(): LineAccountCacheEntry | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(LINE_ACCOUNT_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const entry = JSON.parse(raw) as LineAccountCacheEntry;
    if (!entry?.data || !isFresh(entry)) {
      localStorage.removeItem(LINE_ACCOUNT_CACHE_KEY);
      return null;
    }

    return entry;
  } catch {
    localStorage.removeItem(LINE_ACCOUNT_CACHE_KEY);
    return null;
  }
}

export function peekLineAccountCache(): LineAccountResponse | null {
  const data = readFreshCacheData();
  if (!data?.connected) {
    return null;
  }

  return data;
}

function readFreshCacheData(): LineAccountResponse | null {
  if (memoryCache && isFresh(memoryCache)) {
    return memoryCache.data;
  }

  const stored = readStoredCache();
  if (!stored) {
    memoryCache = null;
    return null;
  }

  memoryCache = stored;
  return stored.data;
}

export function setCachedLineAccount(data: LineAccountResponse) {
  if (!data.connected) {
    invalidateLineAccountCache();
    return;
  }
  const entry: LineAccountCacheEntry = {
    data: {
      connected: data.connected,
      id: data.id,
      name: data.name,
      hasCredentials: data.hasCredentials,
      channelAccessTokenMasked: data.channelAccessTokenMasked,
      channelSecretMasked: data.channelSecretMasked,
      oaInfo: data.oaInfo ?? null,
    },
    cachedAt: Date.now(),
    userKey: getUserKey(),
  };

  memoryCache = entry;

  if (typeof window !== "undefined") {
    localStorage.setItem(LINE_ACCOUNT_CACHE_KEY, JSON.stringify(entry));
  }
}

export function invalidateLineAccountCache() {
  memoryCache = null;
  inflightRequest = null;

  if (typeof window !== "undefined") {
    localStorage.removeItem(LINE_ACCOUNT_CACHE_KEY);
  }
}

export function fetchLineAccount(options?: {
  force?: boolean;
}): Promise<LineAccountResponse> {
  if (!options?.force) {
    const cached = peekLineAccountCache();
    if (cached) {
      return Promise.resolve(cached);
    }
  }

  if (inflightRequest) {
    return inflightRequest;
  }

  inflightRequest = (async () => {
    const response = await fetch(API_ENDPOINTS.LINE.ACCOUNT, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    await assertOkResponse(response, "Failed to load LINE account");
    const data = (await response.json()) as LineAccountResponse;
    setCachedLineAccount(data);
    return data;
  })().finally(() => {
    inflightRequest = null;
  });

  return inflightRequest;
}

function omitMaskedSecret(value?: string) {
  if (!value || value.startsWith("••••")) {
    return undefined;
  }

  return value;
}

export async function submitLineAccount(payload: {
  action: "test" | "save";
  /** Existing OA to test; omit to connect a new OA. */
  lineAccountId?: string;
  channelAccessToken?: string;
  channelSecret?: string;
  name?: string;
}): Promise<LineAccountResponse> {
  const response = await fetch(API_ENDPOINTS.LINE.ACCOUNT, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      action: payload.action,
      lineAccountId: payload.lineAccountId,
      channelAccessToken: omitMaskedSecret(payload.channelAccessToken),
      channelSecret: omitMaskedSecret(payload.channelSecret),
      name: payload.name,
    }),
  });

  await assertOkResponse(response, "Connection failed");
  const data = (await response.json()) as LineAccountResponse;

  // The cache holds the user's own OA; a super admin also tests or connects
  // other OAs, so only refresh it for that one and reload it after a connect.
  if (data.connected && data.id && data.id === peekLineAccountCache()?.id) {
    setCachedLineAccount(data);
  } else if (payload.action === "save") {
    invalidateLineAccountCache();
  }

  return data;
}

/** Super admin: every OA, for the settings OA picker and user form. */
export async function fetchAdminLineAccounts(): Promise<AdminLineAccount[]> {
  const response = await fetch(API_ENDPOINTS.ADMIN.LINE_ACCOUNTS, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  await assertOkResponse(response, "Failed to load LINE accounts");
  return (await response.json()) as AdminLineAccount[];
}

/** Super admin: settings payload of any OA. */
export async function fetchAdminLineAccount(
  id: string,
): Promise<LineAccountResponse> {
  const response = await fetch(API_ENDPOINTS.ADMIN.LINE_ACCOUNT(id), {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  await assertOkResponse(response, "Failed to load LINE account");
  return (await response.json()) as LineAccountResponse;
}
