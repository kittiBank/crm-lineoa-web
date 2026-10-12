import { Clock, Lock, Radio } from "lucide-react";
import { BroadcastTrackingSummary } from "../../types/tracking";

function formatTimeLeft(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) {
    return "closing";
  }

  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;
}

interface TrackingWindowBadgeProps {
  tracking: BroadcastTrackingSummary["tracking"];
}

/** Shows whether the 24h tracking window is still collecting data. */
export function TrackingWindowBadge({ tracking }: TrackingWindowBadgeProps) {
  if (tracking.state === "active" && tracking.expiresAt) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <Radio className="h-3.5 w-3.5" />
        Tracking · {formatTimeLeft(tracking.expiresAt)}
      </span>
    );
  }

  if (tracking.state === "closed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
        <Lock className="h-3.5 w-3.5" />
        Tracking closed
        {tracking.expiresAt
          ? ` · ${new Date(tracking.expiresAt).toLocaleString("en-GB")}`
          : ""}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
      <Clock className="h-3.5 w-3.5" />
      Tracking not available
    </span>
  );
}
