"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, MessageSquareShare } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "../lib/format";
import { useNotifications } from "../lib/use-notifications";
import { AppNotification } from "../types";

/** Navbar bell with unread count and a dropdown of recent notifications. */
export function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const {
    items,
    unread,
    hasMore,
    isLoadingMore,
    loadMore,
    markRead,
    markAllRead,
  } = useNotifications();

  const handleOpen = (notification: AppNotification) => {
    setIsOpen(false);
    if (!notification.readAt) void markRead(notification.id);
    if (notification.conversationId) {
      router.push(`/inbox?c=${encodeURIComponent(notification.conversationId)}`);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        aria-label={
          unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
        }
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors hover:bg-blue-300/30"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] rounded-full bg-red-500 px-1 text-center text-[11px] leading-[18px] font-semibold text-white ring-2 ring-blue-500">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0 sm:w-96">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">
            Notifications
          </p>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Mark all as read
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            <Bell className="h-6 w-6" />
            No notifications yet
          </div>
        ) : (
          <ul className="max-h-96 overflow-y-auto py-1">
            {items.map((notification) => (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() => handleOpen(notification)}
                  className={cn(
                    "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50",
                    !notification.readAt && "bg-blue-50/60 dark:bg-blue-900/20",
                  )}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                    <MessageSquareShare className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-gray-900 dark:text-white">
                      {notification.title}
                    </span>
                    <span className="block text-sm text-gray-600 dark:text-gray-300">
                      {notification.body}
                    </span>
                    <span
                      className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400"
                      suppressHydrationWarning
                    >
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </span>
                  {!notification.readAt && (
                    <span
                      aria-label="Unread"
                      className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500"
                    />
                  )}
                </button>
              </li>
            ))}
            {hasMore && (
              <li className="px-4 py-2">
                <button
                  type="button"
                  disabled={isLoadingMore}
                  onClick={() => void loadMore()}
                  className="w-full rounded-md py-1.5 text-xs font-medium text-blue-600 hover:bg-gray-50 disabled:opacity-60 dark:text-blue-400 dark:hover:bg-gray-700/50"
                >
                  {isLoadingMore ? "Loading..." : "Load more"}
                </button>
              </li>
            )}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
