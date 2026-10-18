import { useEffect, useState } from "react";
import { fetchInboxSummary } from "./api";
import { usePolling } from "./use-polling";

const UNREAD_POLL_MS = 30_000;

/** Unread count across open/pending chats, for the sidebar badge. */
export function useInboxUnread(): number {
  const [unread, setUnread] = useState(0);

  const load = () =>
    fetchInboxSummary()
      .then((summary) => setUnread(summary.unread))
      .catch(() => undefined); // Badge is optional.

  useEffect(() => {
    void load();
  }, []);

  usePolling(load, UNREAD_POLL_MS);

  return unread;
}
