"use client";

import { useEffect, useRef } from "react";
import liff from "@line/liff";
import { Loader2 } from "lucide-react";

const LIFF_INIT_TIMEOUT_MS = 10000;
/** If the SDK has not moved on to liff.state by itself, navigate manually. */
const SDK_REDIRECT_GRACE_MS = 1500;

interface LiffEntryRedirectProps {
  /** Same-site path from `liff.state`, already validated by the page. */
  liffState: string;
}

/**
 * LIFF primary redirect: LINE opens the endpoint URL (/) with `liff.state`
 * and the login credentials in the URL. liff.init() must run here first so
 * the SDK stores those credentials; it then opens `liff.state` itself. A
 * server redirect would drop them and every LIFF page would start logged out.
 */
export function LiffEntryRedirect({ liffState }: LiffEntryRedirectProps) {
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    const goToState = () => window.location.replace(liffState);
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID?.trim();
    if (!liffId) {
      goToState();
      return;
    }

    const fallback = setTimeout(goToState, LIFF_INIT_TIMEOUT_MS);

    liff
      .init({ liffId })
      .then(() => {
        clearTimeout(fallback);
        setTimeout(goToState, SDK_REDIRECT_GRACE_MS);
      })
      .catch(() => {
        clearTimeout(fallback);
        goToState();
      });
  }, [liffState]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-gray-600 dark:text-gray-300">
      <Loader2 className="mr-2 h-5 w-5 animate-spin text-green-600" />
      Opening…
    </div>
  );
}
