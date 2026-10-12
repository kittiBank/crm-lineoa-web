"use client";

import { useCallback, useEffect, useState } from "react";
import { Info, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";
import {
  exportTrackingRecipients,
  fetchBroadcastTracking,
  fetchTrackingRecipients,
  syncBroadcastTracking,
} from "../lib/tracking-api";
import {
  BroadcastTrackingRecipientsResponse,
  BroadcastTrackingSummary,
  TrackingRecipientFilter,
} from "../types/tracking";
import { TrackingMetrics } from "../components/tracking/tracking-metrics";
import { TrackingWindowBadge } from "../components/tracking/tracking-window-badge";
import { TrackingLinksTable } from "../components/tracking/tracking-links-table";
import { TrackingRecipientsTable } from "../components/tracking/tracking-recipients-table";

const SEARCH_DEBOUNCE_MS = 300;
const DEFAULT_PAGE_SIZE = 20;

const SEND_MODE_NOTES: Record<string, string> = {
  broadcast: "Sent to all friends — LINE Insight stats per message.",
  multicast: "Sent to a segment — LINE Insight stats are daily totals.",
  push: "Personalized send — LINE Insight stats are daily totals.",
};

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
  const [isSyncing, setIsSyncing] = useState(false);

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
    let isCancelled = false;

    fetchBroadcastTracking(broadcastId)
      .then((data) => {
        if (!isCancelled) {
          setSummary(data);
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          setSummaryError(
            error instanceof Error ? error.message : "Failed to load tracking",
          );
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [broadcastId]);

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
  }, [broadcastId, page, pageSize, filter, search, recipientsKey]);

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      setSummary(await syncBroadcastTracking(broadcastId));
      toast.success("LINE Insight refreshed");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to refresh LINE Insight",
      );
    } finally {
      setIsSyncing(false);
    }
  }, [broadcastId, toast]);

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
  const canSync = tracking.state !== "unavailable" && !insight?.isFinal;
  const hasLinkClicks = summary.links.some(
    (link) => link.totalClicks > 0 || (link.lineClicks ?? 0) > 0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <TrackingWindowBadge tracking={tracking} />
          {insight ? (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              LINE Insight {insight.isFinal ? "final" : "updated"}{" "}
              {new Date(insight.syncedAt).toLocaleString("en-GB")}
            </span>
          ) : null}
        </div>
        {canSync ? (
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
            />
            Refresh LINE Insight
          </button>
        ) : null}
      </div>

      {tracking.state === "unavailable" ? (
        <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          This broadcast was sent before tracking was enabled (or nothing was
          delivered), so only delivery results are available.
        </div>
      ) : null}

      <TrackingMetrics summary={summary} />

      <div className="flex gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>
          Reach and clicks are recorded by this CRM per LINE user. Read comes
          from LINE Insight, which reports totals only, hides values under 20
          users, and can lag by several hours. Tracking stops 24 hours after
          sending.
          {tracking.sendMode
            ? ` ${SEND_MODE_NOTES[tracking.sendMode] ?? ""}`
            : ""}
          {insight?.syncError
            ? ` Last LINE sync error: ${insight.syncError}`
            : ""}
        </p>
      </div>

      {hasLinkClicks ? <TrackingLinksTable links={summary.links} /> : null}

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
