import { useEffect, useState } from "react";
import {
  useRealtimeConnected,
  useRealtimeEvent,
} from "@/lib/realtime/realtime-provider";
import { fetchInboxSummary } from "./api";
import { usePolling } from "./use-polling";

const UNREAD_POLL_MS = 30_000;
/** Safety net only; realtime events drive updates while connected. */
const UNREAD_POLL_CONNECTED_MS = 120_000;

/** Unread count across open/pending chats, for the sidebar badge. */
export function useInboxUnread(): number {
  const [unread, setUnread] = useState(0);
  const isConnected = useRealtimeConnected();

  const load = () =>
    fetchInboxSummary()
      .then((summary) => setUnread(summary.unread))
      .catch(() => undefined); // Badge is optional.

  useEffect(() => {
    void load();
  }, []);

  useRealtimeEvent("inbox.updated", () => void load());
  useRealtimeEvent("connected", () => void load());
  usePolling(load, isConnected ? UNREAD_POLL_CONNECTED_MS : UNREAD_POLL_MS);

  return unread;
}
