import { clearAuth, getToken, redirectToLogin } from "./auth";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) {
    clearAuth();
    redirectToLogin();
    throw new ApiError("Authentication required", 401);
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function parseApiError(response: Response): Promise<string> {
  const error = await response.json().catch(() => ({}));
  const message = error.message;

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  return typeof message === "string" ? message : "";
}

export async function assertOkResponse(
  response: Response,
  fallbackMessage: string,
): Promise<void> {
  if (response.ok) {
    return;
  }

  if (response.status === 401) {
    clearAuth();
    redirectToLogin();
    throw new ApiError("Session expired", 401);
  }

  const message = await parseApiError(response);
  throw new ApiError(message || fallbackMessage, response.status);
}
