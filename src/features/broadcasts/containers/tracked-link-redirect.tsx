"use client";

import { useEffect, useRef, useState } from "react";
import liff from "@line/liff";
import { Loader2 } from "lucide-react";
import { recordTrackedClick } from "../lib/tracked-link";

const LIFF_INIT_TIMEOUT_MS = 5000;

type LiffIdentity = { idToken?: string; lineUserId?: string };

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

/**
 * Identifies the LINE user without forcing a login: inside LINE the user is
 * always logged in; in an external browser the click is recorded anonymously.
 * `?lineUserId=` works as a local-test shortcut, like the other LIFF pages.
 */
async function resolveIdentity(): Promise<LiffIdentity> {
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
    if (!ready || !liff.isLoggedIn()) {
      return {};
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
      const identity = await resolveIdentity();
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
