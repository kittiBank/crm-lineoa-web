"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { API_ENDPOINTS } from "@/constants/api";
import { getToken } from "@/lib/auth";
import { readEventStream } from "./sse";

/**
 * Events from GET /realtime/stream, plus `connected`, fired locally on every
 * (re)connect so listeners can refetch anything missed while offline.
 */
export type RealtimeEventType = "notification" | "inbox.updated" | "connected";

type Listener = (data: unknown) => void;

interface RealtimeContextValue {
  isConnected: boolean;
  subscribe: (type: RealtimeEventType, listener: Listener) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

const RETRY_MIN_MS = 1_000;
const RETRY_MAX_MS = 30_000;

/** Holds one SSE connection for the signed-in admin app. */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const listenersRef = useRef(new Map<RealtimeEventType, Set<Listener>>());

  useEffect(() => {
    const controller = new AbortController();
    let retryMs = RETRY_MIN_MS;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const emit = (type: RealtimeEventType, data: unknown) => {
      listenersRef.current.get(type)?.forEach((listener) => listener(data));
    };

    const connect = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const response = await fetch(API_ENDPOINTS.REALTIME_STREAM, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
          },
          cache: "no-store",
          signal: controller.signal,
        });

        // Expired session: page requests handle the redirect to login.
        if (response.status === 401) return;
        if (!response.ok || !response.body) {
          throw new Error(`Realtime stream failed (${response.status})`);
        }

        retryMs = RETRY_MIN_MS;
        setIsConnected(true);
        emit("connected", null);

        await readEventStream(response.body, (event) => {
          if (event.type === "ping") return;
          try {
            emit(event.type as RealtimeEventType, JSON.parse(event.data));
          } catch {
            // Ignore malformed payloads.
          }
        });
      } catch {
        // Network drop or abort; retried below unless unmounted.
      }

      setIsConnected(false);
      if (controller.signal.aborted) return;
      retryTimer = setTimeout(() => void connect(), retryMs);
      retryMs = Math.min(retryMs * 2, RETRY_MAX_MS);
    };

    void connect();

    return () => {
      controller.abort();
      clearTimeout(retryTimer);
    };
  }, []);

  const subscribe = useCallback<RealtimeContextValue["subscribe"]>(
    (type, listener) => {
      const listeners = listenersRef.current;
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(listener);
      return () => {
        listeners.get(type)?.delete(listener);
      };
    },
    [],
  );

  const value = useMemo(
    () => ({ isConnected, subscribe }),
    [isConnected, subscribe],
  );

  return (
    <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
  );
}

/** Whether the SSE stream is up; use it to slow down fallback polling. */
export function useRealtimeConnected(): boolean {
  return useContext(RealtimeContext)?.isConnected ?? false;
}

/** Calls `handler` for each event of `type`. Safe outside the provider. */
export function useRealtimeEvent<T = unknown>(
  type: RealtimeEventType,
  handler: (data: T) => void,
) {
  const context = useContext(RealtimeContext);
  const subscribe = context?.subscribe;
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!subscribe) return;
    return subscribe(type, (data) => handlerRef.current(data as T));
  }, [subscribe, type]);
}
