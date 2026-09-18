import { BroadcastStatus } from "../types";

/**
 * Shared status → badge/chip color mapping, used by both the table's
 * StatusBadge and the calendar view's day-cell chips so they stay in sync.
 */
export const BROADCAST_STATUS_STYLES: Record<BroadcastStatus, string> = {
  Sent: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  Scheduled:
    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  Draft: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400",
  Failed: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  Processing:
    "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
};

/**
 * Bullet/dot color per status, used where a full colored tag would be too
 * heavy (e.g. the calendar view's day-cell chip list).
 */
export const BROADCAST_STATUS_DOT_COLORS: Record<BroadcastStatus, string> = {
  Sent: "bg-green-500",
  Scheduled: "bg-blue-500",
  Draft: "bg-gray-400",
  Failed: "bg-red-500",
  Processing: "bg-amber-500",
};
