"use client";

import { Suspense } from "react";
import { InboxContainer } from "@/features/inbox/containers/inbox";

/**
 * Inbox page
 * 1:1 chat with LINE followers, agent assignment and conversation status
 */
export default function InboxPage() {
  // useSearchParams (the ?c= deep link) needs a Suspense boundary.
  return (
    <Suspense>
      <InboxContainer />
    </Suspense>
  );
}
