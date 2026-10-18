import { useEffect, useRef } from "react";

/**
 * Calls `callback` every `intervalMs` while enabled and the tab is visible,
 * and once right away when the tab becomes visible again.
 */
export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs: number,
  enabled = true,
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      if (document.visibilityState === "visible") {
        void callbackRef.current();
      }
    };

    const timer = setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", tick);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [enabled, intervalMs]);
}
