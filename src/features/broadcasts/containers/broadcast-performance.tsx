"use client";

import { useEffect, useRef, useState } from "react";
import { Info, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";
import {
  exportTrackingRecipients,
  fetchBroadcastTracking,
  fetchTrackingRecipients,
} from "../lib/tracking-api";
import {
  BroadcastTrackingRecipientsResponse,
  BroadcastTrackingSummary,
  TrackingRecipientFilter,
} from "../types/tracking";
import { TrackingMetrics } from "../components/tracking/tracking-metrics";
import { TrackingWindowBadge } from "../components/tracking/tracking-window-badge";
import {
  TrackingLinksTable,
  hasLinkClicks,
} from "../components/tracking/tracking-links-table";
import { TrackingRecipientsTable } from "../components/tracking/tracking-recipients-table";

const SEARCH_DEBOUNCE_MS = 300;
const DEFAULT_PAGE_SIZE = 20;
/** Live refresh; the API also pulls LINE Insight at most once a minute. */
const POLL_INTERVAL_MS = 60_000;

const SEND_MODE_NOTES: Record<string, string> = {
  broadcast: "LINE stats per message",
  multicast: "LINE stats are daily totals",
  push: "LINE stats are daily totals",
};

function formatTime(value: Date): string {
  return value.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface BroadcastPerformanceProps {
  broadcastId: string;
  broadcastName: string;
}

/** Performance tab of the broadcast view page: KPIs, link clicks, recipients. */
export function BroadcastPerformance({
  broadcastId,
  broadcastName,
}: BroadcastPerformanceProps) {
  const toast = useToast();
  const [summary, setSummary] = useState<BroadcastTrackingSummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const hasSummaryRef = useRef(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  // Bumped by the poll timer, tab focus and the refresh button.
  const [refreshTick, setRefreshTick] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [recipientsState, setRecipientsState] = useState<{
    key: string;
    data: BroadcastTrackingRecipientsResponse | null;
    error: string | null;
  }>({ key: "", data: null, error: null });
  const [filter, setFilter] = useState<TrackingRecipientFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isExporting, setIsExporting] = useState(false);

  // Loading = the last response is for a different query than the current one.
  const recipientsKey = `${page}|${pageSize}|${filter}|${search}`;
  const isLoadingRecipients = recipientsState.key !== recipientsKey;

  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") {
        setRefreshTick((tick) => tick + 1);
      }
    };

    const timer = setInterval(refreshIfVisible, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", refreshIfVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    fetchBroadcastTracking(broadcastId)
      .then((data) => {
        if (!isCancelled) {
          hasSummaryRef.current = true;
          setSummary(data);
          setSummaryError(null);
          setUpdatedAt(new Date());
        }
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }
        const message =
          error instanceof Error ? error.message : "Failed to load tracking";
        // Keep showing the last good data if a background refresh fails.
        if (hasSummaryRef.current) {
          toast.error(message);
        } else {
          setSummaryError(message);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsRefreshing(false);
        }
      });

    return () => {
      isCancelled = true;
    };
    // toast is stable enough; re-running on it would refetch needlessly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broadcastId, refreshTick]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let isCancelled = false;

    fetchTrackingRecipients(broadcastId, {
      page,
      limit: pageSize,
      filter,
      search,
    })
      .then((data) => {
        if (!isCancelled) {
          setRecipientsState({ key: recipientsKey, data, error: null });
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          setRecipientsState((previous) => ({
            key: recipientsKey,
            data: previous.data,
            error:
              error instanceof Error
                ? error.message
                : "Failed to load recipients",
          }));
        }
      });

    return () => {
      isCancelled = true;
    };
    // refreshTick re-fetches the same page in the background (no overlay).
  }, [broadcastId, page, pageSize, filter, search, recipientsKey, refreshTick]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTick((tick) => tick + 1);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const count = await exportTrackingRecipients(
        broadcastId,
        broadcastName,
        filter,
        search,
      );
      toast.success(`Exported ${count.toLocaleString()} recipient(s)`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  if (summaryError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
        {summaryError}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading performance...
      </div>
    );
  }

  const { tracking, insight } = summary;
  const showLinkClicks = summary.links.some(hasLinkClicks);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <TrackingWindowBadge tracking={tracking} />
          <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Info className="h-3.5 w-3.5 shrink-0" />
            Tracked 24h after sending · Read from LINE (hidden under 20 users)
            {tracking.sendMode && SEND_MODE_NOTES[tracking.sendMode]
              ? ` · ${SEND_MODE_NOTES[tracking.sendMode]}`
              : ""}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {updatedAt ? (
            <span title={insight ? `LINE Insight ${insight.isFinal ? "final" : "synced"} ${new Date(insight.syncedAt).toLocaleString("en-GB")}` : undefined}>
              Updated {formatTime(updatedAt)}
            </span>
          ) : null}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Refresh now"
            title="Refresh now (auto-refreshes every minute)"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-60 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {insight?.syncError ? (
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Last LINE Insight sync error: {insight.syncError}
        </p>
      ) : null}

      {tracking.state === "unavailable" ? (
        <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          This broadcast was sent before tracking was enabled (or nothing was
          delivered), so only delivery results are available.
        </div>
      ) : null}

      <TrackingMetrics summary={summary} />

      {showLinkClicks ? (
        <TrackingLinksTable
          links={summary.links}
          showLineStats={summary.hasLineLinkStats}
        />
      ) : null}

      {recipientsState.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
          {recipientsState.error}
        </div>
      ) : null}

      <TrackingRecipientsTable
        result={recipientsState.data}
        isLoading={isLoadingRecipients}
        filter={filter}
        search={searchInput}
        isExporting={isExporting}
        onFilterChange={(next) => {
          setFilter(next);
          setPage(1);
        }}
        onSearchChange={setSearchInput}
        onPageChange={setPage}
        onPageSizeChange={(next) => {
          setPageSize(next);
          setPage(1);
        }}
        onExport={handleExport}
      />
    </div>
  );
}
