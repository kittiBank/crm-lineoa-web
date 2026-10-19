import { useCallback, useEffect, useState } from "react";
import { usePolling } from "@/features/inbox/lib/use-polling";
import { useToast } from "@/lib/hooks/useToast";
import {
  useRealtimeConnected,
  useRealtimeEvent,
} from "@/lib/realtime/realtime-provider";
import { AppNotification } from "../types";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./api";

/** Only used while the realtime stream is down. */
const FALLBACK_POLL_MS = 60_000;

/** Bell state: latest notifications, unread count, live updates. */
export function useNotifications() {
  const toast = useToast();
  const isConnected = useRealtimeConnected();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const reload = useCallback(
    () =>
      fetchNotifications()
        .then((page) => {
          setItems(page.items);
          setNextCursor(page.nextCursor);
          setUnread(page.unread);
        })
        .catch(() => undefined), // The bell is optional; keep what we have.
    [],
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  // Catch up on anything sent while the stream was reconnecting.
  useRealtimeEvent("connected", () => void reload());

  useRealtimeEvent<AppNotification>("notification", (notification) => {
    setItems((current) => [
      notification,
      ...current.filter((item) => item.id !== notification.id),
    ]);
    setUnread((count) => count + 1);
    toast.info(notification.body);
  });

  usePolling(reload, FALLBACK_POLL_MS, !isConnected);

  const loadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const page = await fetchNotifications(nextCursor);
      setItems((current) => [
        ...current,
        ...page.items.filter(
          (item) => !current.some((row) => row.id === item.id),
        ),
      ]);
      setNextCursor(page.nextCursor);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load notifications",
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  const markRead = async (id: string) => {
    const now = new Date().toISOString();
    setItems((current) =>
      current.map((item) =>
        item.id === id && !item.readAt ? { ...item, readAt: now } : item,
      ),
    );
    try {
      setUnread((await markNotificationRead(id)).unread);
    } catch {
      void reload();
    }
  };

  const markAllRead = async () => {
    const now = new Date().toISOString();
    setItems((current) =>
      current.map((item) => (item.readAt ? item : { ...item, readAt: now })),
    );
    setUnread(0);
    try {
      await markAllNotificationsRead();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update notifications",
      );
      void reload();
    }
  };

  return {
    items,
    unread,
    hasMore: Boolean(nextCursor),
    isLoadingMore,
    loadMore,
    markRead,
    markAllRead,
  };
}
