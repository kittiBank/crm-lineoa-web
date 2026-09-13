"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  BroadcastHeader,
  BroadcastListSkeleton,
  SearchFilters,
  BroadcastTable,
  MetricsSection,
  QuotaSection,
  Pagination,
} from "@/features/broadcasts/components";
import {
  deleteBroadcast,
  fetchBroadcastById,
  fetchMessageQuota,
} from "@/features/broadcasts/lib/api";
import {
  clearBroadcastListDataCache,
  loadBroadcastListPageData,
} from "@/features/broadcasts/lib/load-broadcast-list-data";
import { filterBroadcasts } from "@/features/broadcasts/lib/mappers";
import { Broadcast, FilterOptions, MessageQuota, MetricsData } from "@/features/broadcasts/types";
import { useToast } from "@/lib/hooks/useToast";

const EMPTY_METRICS: MetricsData = {
  totalSent: 0,
  percentageChange: 0,
  averageReadRate: 0,
  readRatePercentageChange: 0,
  activeScheduled: 0,
  nextBroadcastTime: "—",
};

const STATUS_POLL_INTERVAL_MS = 3000;
const TERMINAL_BROADCAST_STATUSES = new Set(["completed", "failed"]);

export function BroadcastsListContainer() {
  const router = useRouter();
  const toast = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: "",
    status: "All Status",
    dateRange: "",
  });
  const [allBroadcasts, setAllBroadcasts] = useState<Broadcast[]>([]);
  const [metrics, setMetrics] = useState<MetricsData>(EMPTY_METRICS);
  const [quota, setQuota] = useState<MessageQuota | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [broadcastToDelete, setBroadcastToDelete] = useState<Broadcast | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadBroadcasts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [pageData, nextQuota] = await Promise.all([
          loadBroadcastListPageData(),
          fetchMessageQuota().catch(() => null),
        ]);

        if (isCancelled) {
          return;
        }

        setAllBroadcasts(pageData.broadcasts);
        setMetrics(pageData.metrics);
        setQuota(nextQuota);
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load broadcasts",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadBroadcasts();

    return () => {
      isCancelled = true;
    };
  }, []);

  const processingBroadcastKey = useMemo(
    () =>
      allBroadcasts
        .filter((broadcast) => broadcast.status === "Processing")
        .map((broadcast) => broadcast.id)
        .sort()
        .join(","),
    [allBroadcasts],
  );

  useEffect(() => {
    if (!processingBroadcastKey) {
      return;
    }

    const processingBroadcastIds = processingBroadcastKey.split(",");
    let isCancelled = false;

    const refreshAfterTerminalStatus = async () => {
      const data = await loadBroadcastListPageData({ force: true });
      if (isCancelled) {
        return;
      }

      setAllBroadcasts(data.broadcasts);
      setMetrics(data.metrics);

      const stillProcessing = data.broadcasts.some(
        (broadcast) => broadcast.status === "Processing",
      );

      if (!stillProcessing) {
        const nextQuota = await fetchMessageQuota();
        if (!isCancelled) {
          setQuota(nextQuota);
        }
      }
    };

    const pollProcessingStatus = async () => {
      try {
        const records = await Promise.all(
          processingBroadcastIds.map((id) => fetchBroadcastById(id)),
        );
        if (isCancelled) {
          return;
        }

        const reachedTerminal = records.some((record) =>
          TERMINAL_BROADCAST_STATUSES.has(record.status),
        );

        if (reachedTerminal) {
          await refreshAfterTerminalStatus();
        }
      } catch {
        // Keep the current list/quota until the next status poll.
      }
    };

    void pollProcessingStatus();
    const timer = window.setInterval(
      pollProcessingStatus,
      STATUS_POLL_INTERVAL_MS,
    );

    return () => {
      isCancelled = true;
      window.clearInterval(timer);
    };
  }, [processingBroadcastKey]);

  const filteredBroadcasts = useMemo(
    () =>
      filterBroadcasts(
        allBroadcasts,
        filters.searchQuery,
        filters.status,
        filters.dateRange,
      ),
    [allBroadcasts, filters],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBroadcasts.length / itemsPerPage),
  );
  const paginatedBroadcasts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBroadcasts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBroadcasts, currentPage, itemsPerPage]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = (id: string) => {
    router.push(`/broadcasts/${id}/edit`);
  };

  const handleView = (id: string) => {
    router.push(`/broadcasts/${id}/view`);
  };

  const handleDeleteClick = (id: string) => {
    const broadcast = allBroadcasts.find((item) => item.id === id);
    if (
      broadcast &&
      (broadcast.status === "Draft" || broadcast.status === "Scheduled")
    ) {
      setBroadcastToDelete(broadcast);
    }
  };

  const handleConfirmDelete = async () => {
    if (!broadcastToDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteBroadcast(broadcastToDelete.id);
      setAllBroadcasts((current) =>
        current.filter((item) => item.id !== broadcastToDelete.id),
      );
      clearBroadcastListDataCache();
      setBroadcastToDelete(null);
      toast.success(
        `"${broadcastToDelete.campaignName}" deleted successfully`,
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete broadcast",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Broadcasts", isActive: true },
  ];

  if (isLoading) {
    return (
      <div className="space-y-2" suppressHydrationWarning>
        <Breadcrumbs items={breadcrumbItems} />
        <BroadcastListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2" suppressHydrationWarning>
      <Breadcrumbs items={breadcrumbItems} />
      <BroadcastHeader />

      <QuotaSection quota={quota} />

      <SearchFilters filters={filters} onFilterChange={handleFilterChange} />

      <div className="mt-6">
        <BroadcastTable
          broadcasts={paginatedBroadcasts}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDeleteClick}
        />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredBroadcasts.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={(newItemsPerPage) => {
          setItemsPerPage(newItemsPerPage);
          setCurrentPage(1);
        }}
      />

      <MetricsSection
        totalSent={metrics.totalSent}
        percentageChange={metrics.percentageChange}
        averageReadRate={metrics.averageReadRate}
        readRatePercentageChange={metrics.readRatePercentageChange}
        activeScheduled={metrics.activeScheduled}
        nextBroadcastTime={metrics.nextBroadcastTime}
      />

      <ConfirmDialog
        open={Boolean(broadcastToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setBroadcastToDelete(null);
          }
        }}
        title="Delete Broadcast"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              &quot;{broadcastToDelete?.campaignName}&quot;
            </span>
            ? This action cannot be undone.
          </>
        }
        variant="destructive"
        confirmLabel="Delete"
        loadingLabel="Deleting..."
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        showCloseButton={!isDeleting}
      />
    </div>
  );
}
