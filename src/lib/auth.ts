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

export function clearAuth(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function redirectToDashboard(): void {
  window.location.href = "/dashboard";
}

export function redirectToLogin(): void {
  window.location.href = "/login";
}
