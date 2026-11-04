"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Activity, TrendingUp, UserMinus, UserPlus, Users } from "lucide-react";
import {
  ActivityByHourChart,
  CustomerTagBars,
  DashboardSkeleton,
  FollowerMovementChart,
  KpiCard,
  MembersBreakdown,
  PeriodSummary,
  USER_FILTER_KEYS,
  USER_FILTER_VALUES,
  UsersFilterBar,
} from "@/features/dashboard/components";
import { fetchDashboardUsers } from "@/features/dashboard/lib/api";
import {
  computeDelta,
  formatNumber,
  formatPercent,
  formatSigned,
} from "@/features/dashboard/lib/format";
import {
  DashboardPeriod,
  DashboardUserFilters,
  DashboardUsers,
} from "@/features/dashboard/types";

function readFilters(params: URLSearchParams): DashboardUserFilters {
  const filters: Record<string, string> = {};
  for (const key of USER_FILTER_KEYS) {
    const value = params.get(key);
    if (value && USER_FILTER_VALUES[key].includes(value)) {
      filters[key] = value;
    }
  }
  return filters as DashboardUserFilters;
}

export function UsersTab({ period }: { period: DashboardPeriod }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const filters = useMemo(
    () => readFilters(new URLSearchParams(queryString)),
    [queryString],
  );
  const filterKey = JSON.stringify(filters);

  const [data, setData] = useState<DashboardUsers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setFilters = useCallback(
    (next: DashboardUserFilters) => {
      const params = new URLSearchParams(queryString);
      for (const key of USER_FILTER_KEYS) {
        const value = next[key];
        if (value) params.set(key, value);
        else params.delete(key);
      }
      router.replace(`${pathname}?${params}`, { scroll: false });
    },
    [pathname, queryString, router],
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const users = await fetchDashboardUsers(
          period,
          JSON.parse(filterKey) as DashboardUserFilters,
        );
        if (!cancelled) {
          setData(users);
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
      <UsersFilterBar filters={filters} onChange={setFilters} />
      <UsersTabBody data={data} isLoading={isLoading} error={error} filters={filters} />
    </div>
  );
}

function UsersTabBody({
  data,
  isLoading,
  error,
  filters,
}: {
  data: DashboardUsers | null;
  isLoading: boolean;
  error: string | null;
  filters: DashboardUserFilters;
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
  const base = kpis.totalFollowers.previous;
  const { activeRate } = kpis;

  return (
    <div className="flex flex-col gap-5">
      <PeriodSummary period={data.period} range={data.range} />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(190px,100%),1fr))] gap-3">
        <KpiCard
          label="Total followers"
          icon={Users}
          value={formatNumber(kpis.totalFollowers.current)}
          delta={computeDelta(kpis.totalFollowers)}
          note="following now"
        />
        <KpiCard
          label="New followers"
          icon={UserPlus}
          value={formatNumber(kpis.newFollowers.current)}
          delta={computeDelta(kpis.newFollowers)}
        />
        <KpiCard
          label="Unfollowed / blocked"
          icon={UserMinus}
          value={formatNumber(kpis.unfollowed.current)}
          delta={computeDelta(kpis.unfollowed, false)}
        />
        <KpiCard
          label="Net growth"
          icon={TrendingUp}
          value={formatSigned(kpis.netGrowth.current)}
          delta={computeDelta(kpis.netGrowth)}
          note={base > 0 ? `${formatPercent((kpis.netGrowth.current / base) * 100)} of base` : undefined}
        />
        <KpiCard
          label={`Active rate (${activeRate.windowDays}d)`}
          icon={Activity}
          value={activeRate.current === null ? "—" : formatPercent(activeRate.current)}
          delta={
            activeRate.current === null || activeRate.previous === null
              ? { percent: null, good: true }
              : computeDelta({ current: activeRate.current, previous: activeRate.previous })
          }
          note="chatted or clicked"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <FollowerMovementChart
          data={data.movement}
          granularity={data.granularity}
          rangeEnd={data.range.end}
          trackingSince={data.trackingSince}
        />
        <MembersBreakdown breakdown={data.breakdown} filters={filters} />
      </div>

      <div className="flex flex-wrap gap-4">
        <ActivityByHourChart activity={data.activity} />
        <CustomerTagBars tags={data.tags} />
      </div>
    </div>
  );
}
