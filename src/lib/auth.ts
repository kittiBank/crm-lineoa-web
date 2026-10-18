export const AUTH_TOKEN_KEY = "token";
export const AUTH_USER_KEY = "user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string, user?: unknown): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
}

/**
 * ID of the signed-in user, read from the JWT `sub` claim. Login returns
 * only the token, so there is no saved profile to read it from.
 */
export function getCurrentUserId(): string | null {
  const token = getToken();
  const payload = token?.split(".")[1];
  if (!payload) return null;

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(base64)) as { sub?: unknown };
    return typeof claims.sub === "string" ? claims.sub : null;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem("crm.line-account.cache");
  localStorage.removeItem("crm.line-account.cache.v2");
  localStorage.removeItem("crm.line-account.cache.v3");
}

export function redirectToDashboard(): void {
  window.location.href = "/dashboard";
}

export function redirectToLogin(): void {
  window.location.href = "/login";
}
