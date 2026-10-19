const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "Just now", "5m ago", "3h ago", "2d ago", then a date. */
export function formatRelativeTime(value: string, now = Date.now()): string {
  const elapsed = now - new Date(value).getTime();

  if (elapsed < MINUTE) return "Just now";
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m ago`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h ago`;
  if (elapsed < 7 * DAY) return `${Math.floor(elapsed / DAY)}d ago`;

  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}
