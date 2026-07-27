import liff from "@line/liff";

export type LiffSession = {
  lineUserId: string;
  displayName?: string;
  isInClient: boolean;
  usingMock: boolean;
};

function getLiffId(): string | undefined {
  const value = process.env.NEXT_PUBLIC_LIFF_ID?.trim();
  return value || undefined;
}

function getMockLineUserId(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const fromQuery = new URLSearchParams(window.location.search).get(
    "lineUserId",
  );
  if (fromQuery?.trim()) {
    return fromQuery.trim();
  }

  return process.env.NEXT_PUBLIC_LIFF_MOCK_USER_ID?.trim() || undefined;
}

function getRedirectUri(): string {
  if (typeof window === "undefined") {
    return "";
  }

  // Keep redirect URI stable — query params can break LINE OAuth redirect.
  return `${window.location.origin}${window.location.pathname}`;
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Init LIFF and resolve LINE user ID.
 * Browser/dev shortcut: ?lineUserId=Uxxxx skips LIFF init entirely.
 */
export async function initLiffSession(): Promise<LiffSession> {
  const liffId = getLiffId();
  const mockLineUserId = getMockLineUserId();

  if (mockLineUserId) {
    return {
      lineUserId: mockLineUserId,
      displayName: "Mock User",
      isInClient: false,
      usingMock: true,
    };
  }

  if (!liffId) {
    throw new Error(
      "LIFF ID is not configured. Set NEXT_PUBLIC_LIFF_ID or use ?lineUserId= for local testing.",
    );
  }

  await withTimeout(
    liff.init({
      liffId,
      withLoginOnExternalBrowser: true,
    }),
    15000,
    "LIFF initialization timed out. Check LIFF Endpoint URL in LINE Developers.",
  );

  if (!liff.isLoggedIn()) {
    liff.login({ redirectUri: getRedirectUri() });

    // liff.login() should redirect away; if we're still here, surface an error.
    await new Promise((resolve) => setTimeout(resolve, 2500));
    throw new Error(
      "LINE login redirect did not start. Open from LINE app (liff.line.me) or test with ?lineUserId=.",
    );
  }

  const profile = await withTimeout(
    liff.getProfile(),
    10000,
    "Failed to load LINE profile. Check LIFF scopes (profile).",
  );

  return {
    lineUserId: profile.userId,
    displayName: profile.displayName,
    isInClient: liff.isInClient(),
    usingMock: false,
  };
}

export function closeLiffWindow(): void {
  try {
    if (typeof window === "undefined") {
      return;
    }

    if (liff.isInClient()) {
      liff.closeWindow();
      return;
    }
  } catch {
    // ignore and fall through
  }

  window.close();
}
