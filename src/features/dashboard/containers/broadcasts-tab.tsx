"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Banknote, CheckCheck, MousePointerClick, Send, Target } from "lucide-react";
import {
  BROADCAST_STATUS_META,
  BROADCAST_STATUS_ORDER,
  BroadcastStatusDonut,
  CampaignTable,
  ClickRateByType,
  DashboardSkeleton,
  FilterBar,
  FilterDefinition,
  KpiCard,
  MESSAGE_TYPE_LABELS,
  PeriodSummary,
  RevenueBySegment,
  SentDeliveredChart,
  readFilterParams,
  writeFilterParams,
} from "@/features/dashboard/components";
import { fetchDashboardBroadcasts } from "@/features/dashboard/lib/api";
import {
  computeDelta,
  formatBaht,
  formatCompact,
  formatNumber,
  formatPercent,
} from "@/features/dashboard/lib/format";
import {
  BroadcastMessageType,
  DashboardBroadcastFilters,
  DashboardBroadcasts,
  DashboardPeriod,
  NullableComparison,
} from "@/features/dashboard/types";

type BroadcastFilterKey = keyof DashboardBroadcastFilters;

const SEGMENT_PATTERN = /^(all|active|new|custom:[A-Za-z0-9_-]{1,64})$/;
const MESSAGE_TYPES = Object.keys(MESSAGE_TYPE_LABELS).filter(
  (type) => type !== "none",
) as Exclude<BroadcastMessageType, "none">[];

function broadcastFilters(
  data: DashboardBroadcasts | null,
  selectedSegment?: string,
): FilterDefinition<BroadcastFilterKey>[] {
  const counts = new Map(data?.statusCounts.map((row) => [row.status, row.count]));
  const allCount = data?.statusCounts.reduce((sum, row) => sum + row.count, 0);
  const withCount = (label: string, count?: number) =>
    count === undefined ? label : `${label} (${formatNumber(count)})`;

  const segments = [...(data?.options.segments ?? [])];
  // Keep a segment from the URL selectable before the options have loaded.
  if (selectedSegment && !segments.some((s) => s.key === selectedSegment)) {
    segments.push({ key: selectedSegment, label: "Selected segment" });
  }
  const types = data?.options.messageTypes.length ? data.options.messageTypes : MESSAGE_TYPES;

  return [
    { key: "search", label: "Search campaigns", type: "search" },
    {
      key: "status",
      label: "Status",
      options: [
        { value: "", label: withCount("All statuses", allCount) },
        ...BROADCAST_STATUS_ORDER.map((status) => ({
          value: status,
          label: withCount(BROADCAST_STATUS_META[status].label, data ? counts.get(status) ?? 0 : undefined),
        })),
      ],
    },
    {
      key: "segment",
      label: "Audience",
      options: [
        { value: "", label: "All segments" },
        ...segments.map((s) => ({ value: s.key, label: s.label })),
      ],
    },
    {
      key: "messageType",
      label: "Message type",
      options: [
        { value: "", label: "All types" },
        ...types.map((type) => ({ value: type, label: MESSAGE_TYPE_LABELS[type] })),
      ],
    },
  ];
}

function rateDelta(value: NullableComparison) {
  return value.current === null || value.previous === null
    ? { percent: null, good: true }
    : computeDelta({ current: value.current, previous: value.previous });
}

export function BroadcastsTab({ period }: { period: DashboardPeriod }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryString = useSearchParams().toString();

  const [data, setData] = useState<DashboardBroadcasts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(() => {
    const params = new URLSearchParams(queryString);
    const segment = params.get("segment") ?? undefined;
    return {
      ...readFilterParams(params, broadcastFilters(null)),
      // Segment ids are not known before the first load.
      ...(segment && SEGMENT_PATTERN.test(segment) ? { segment } : {}),
    } as DashboardBroadcastFilters;
  }, [queryString]);
  const filterKey = JSON.stringify(filters);
  const definitions = useMemo(
    () => broadcastFilters(data, filters.segment),
    [data, filters.segment],
  );

  const setFilters = useCallback(
    (next: DashboardBroadcastFilters) => {
      const params = writeFilterParams(queryString, definitions, next);
      router.replace(`${pathname}?${params}`, { scroll: false });
    },
    [definitions, pathname, queryString, router],
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchDashboardBroadcasts(
          period,
          JSON.parse(filterKey) as DashboardBroadcastFilters,
        );
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [period, filterKey]);

  return (
    <div className="flex flex-col gap-5">
      <FilterBar
        label="Broadcast filters"
        filters={definitions}
        values={filters}
        onChange={(values) => setFilters(values as DashboardBroadcastFilters)}
      />
      <BroadcastsTabBody data={data} isLoading={isLoading} error={error} filters={filters} />
    </div>
  );
}

function BroadcastsTabBody({
  data,
  isLoading,
  error,
  filters,
}: {
  data: DashboardBroadcasts | null;
  isLoading: boolean;
  error: string | null;
  filters: DashboardBroadcastFilters;
}) {
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
        {error ?? "Failed to load dashboard"}
      </div>
    );
  }

  const { kpis } = data;
  const percent = (value: number | null) => (value === null ? "—" : formatPercent(value));

  return (
    <div className="flex flex-col gap-5">
      <PeriodSummary period={data.period} range={data.range} />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(190px,100%),1fr))] gap-3">
        <KpiCard
          label="Broadcasts sent"
          icon={Send}
          value={formatNumber(kpis.broadcastsSent.current)}
          delta={computeDelta(kpis.broadcastsSent)}
          note="campaigns"
        />
        <KpiCard
          label="Messages delivered"
          icon={CheckCheck}
          value={formatNumber(kpis.messagesDelivered.current)}
          delta={computeDelta(kpis.messagesDelivered)}
          note={`of ${formatCompact(kpis.messagesSent.current)} sent`}
        />
        <KpiCard
          label="Delivery rate"
          icon={Target}
          value={percent(kpis.deliveryRate.current)}
          delta={rateDelta(kpis.deliveryRate)}
        />
        <KpiCard
          label="Click rate"
          icon={MousePointerClick}
          value={percent(kpis.clickRate.current)}
          delta={rateDelta(kpis.clickRate)}
          note={`${formatNumber(kpis.clicks.current)} clicks`}
        />
        <KpiCard
          label="Attributed revenue"
          icon={Banknote}
          value={formatBaht(kpis.attributedRevenue.current)}
          delta={computeDelta(kpis.attributedRevenue)}
          note="72h after click"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <SentDeliveredChart data={data.series} rangeEnd={data.range.end} />
        <BroadcastStatusDonut statusCounts={data.statusCounts} status={filters.status} />
      </div>

      <div className="flex flex-wrap gap-4">
        <ClickRateByType rows={data.byMessageType} />
        <RevenueBySegment rows={data.bySegment} />
      </div>

      <div className="flex flex-wrap gap-4">
        <CampaignTable campaigns={data.campaigns} total={data.campaignTotal} />
      </div>
    </div>
  );
}
