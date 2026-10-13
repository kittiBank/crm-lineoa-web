"use client";

import { useEffect, useRef, useState } from "react";
import liff from "@line/liff";
import { Loader2 } from "lucide-react";
import { recordTrackedClick } from "../lib/tracked-link";

const LIFF_INIT_TIMEOUT_MS = 10000;
/** One silent login attempt per link per minute — never loop on failure. */
const LOGIN_ATTEMPT_KEY = "liff-r-login";
const LOGIN_RETRY_AFTER_MS = 60_000;

type LiffIdentity = { idToken?: string; lineUserId?: string };

/**
 * LINE opens /?liff.state=/liff/r/{id} and our root page redirects before
 * liff.init() runs there, which drops the LIFF credentials. Inside LINE a
 * login round-trip is silent, so re-authenticate once (same as /liff/login).
 * Returns true when the page is navigating away to LINE login.
 */
function startSilentLogin(linkId: string): boolean {
  if (!liff.isInClient()) {
    return false;
  }

  const key = `${LOGIN_ATTEMPT_KEY}:${linkId}`;
  try {
    const lastAttempt = Number(sessionStorage.getItem(key) ?? 0);
    if (Date.now() - lastAttempt < LOGIN_RETRY_AFTER_MS) {
      return false;
    }
    sessionStorage.setItem(key, String(Date.now()));
  } catch {
    // Without storage we can't guard against a loop — record anonymously.
    return false;
  }

  liff.login({
    redirectUri: `${window.location.origin}${window.location.pathname}`,
  });
  return true;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

/**
 * Identifies the LINE user: inside LINE via LIFF (silently logging in again if
 * needed); in an external browser the click is recorded anonymously.
 * `?lineUserId=` works as a local-test shortcut, like the other LIFF pages.
 * Resolves to null when the page is redirecting to LINE login.
 */
async function resolveIdentity(linkId: string): Promise<LiffIdentity | null> {
  const mockLineUserId =
    new URLSearchParams(window.location.search).get("lineUserId")?.trim() ||
    process.env.NEXT_PUBLIC_LIFF_MOCK_USER_ID?.trim();
  if (mockLineUserId) {
    return { lineUserId: mockLineUserId };
  }

  const liffId = process.env.NEXT_PUBLIC_LIFF_ID?.trim();
  if (!liffId) {
    return {};
  }

  try {
    const ready = await withTimeout(
      liff.init({ liffId }).then(() => true),
      LIFF_INIT_TIMEOUT_MS,
    );
    if (!ready) {
      return {};
    }

    if (!liff.isLoggedIn()) {
      return startSilentLogin(linkId) ? null : {};
    }

    // The ID token only exists when the LIFF app has the `openid` scope;
    // otherwise fall back to the context / profile like the other LIFF pages.
    const idToken = liff.getIDToken() ?? undefined;
    const lineUserId =
      liff.getDecodedIDToken()?.sub ??
      liff.getContext()?.userId ??
      (await withTimeout(
        liff
          .getProfile()
          .then((profile) => profile.userId)
          .catch(() => null),
        LIFF_INIT_TIMEOUT_MS,
      )) ??
      undefined;

    return { idToken, lineUserId };
  } catch {
    return {};
  }
}

interface TrackedLinkRedirectProps {
  linkId: string;
}

/** Landing page for tracked broadcast links: record the click, then go on. */
export function TrackedLinkRedirect({ linkId }: TrackedLinkRedirectProps) {
  const [failed, setFailed] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    const run = async () => {
      const identity = await resolveIdentity(linkId);
      if (!identity) {
        // Navigating to LINE login; this page reloads with credentials.
        return;
      }
      const url = await recordTrackedClick({ linkId, ...identity });

      if (url) {
        window.location.replace(url);
        return;
      }

      setFailed(true);
    };

    void run();
  }, [linkId]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center text-sm text-gray-600 dark:text-gray-300">
      {failed ? (
        <>
          <p className="font-medium text-gray-900 dark:text-white">
            This link is no longer available
          </p>
          <p>Please go back to the chat and try again later.</p>
        </>
      ) : (
        <>
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          <p>Opening link…</p>
        </>
      )}
    </div>
  );
}
