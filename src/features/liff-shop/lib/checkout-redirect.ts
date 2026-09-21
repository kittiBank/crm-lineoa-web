const PENDING_REDIRECT_KEY = "liff-shop:pending-redirect";

/**
 * Stored in localStorage (not a URL query param) so it survives LINE's OAuth
 * redirect round trip, which drops query params — see features/liff-login/lib/liff.ts.
 */
export function setPendingCheckoutRedirect(path: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PENDING_REDIRECT_KEY, path);
}

export function consumePendingCheckoutRedirect(): string | null {
  if (typeof window === "undefined") return null;
  const path = window.localStorage.getItem(PENDING_REDIRECT_KEY);
  if (path) {
    window.localStorage.removeItem(PENDING_REDIRECT_KEY);
  }
  return path;
}
