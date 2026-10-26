"use client";

import { useEffect, useState } from "react";
import { Banknote, Send, ShoppingBag, UserPlus, Users } from "lucide-react";
import {
  DashboardSkeleton,
  GrowthTrendChart,
  KpiCard,
  PeriodSummary,
  PurchaseFunnel,
  RecentBroadcastTable,
  TopProducts,
} from "@/features/dashboard/components";
import { fetchDashboardOverview } from "@/features/dashboard/lib/api";
import {
  computeDelta,
  describePeriod,
  formatBaht,
  formatNumber,
} from "@/features/dashboard/lib/format";
import { DashboardOverview, DashboardPeriod } from "@/features/dashboard/types";

export function OverviewTab({ period }: { period: DashboardPeriod }) {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const overview = await fetchDashboardOverview(period);
        if (!cancelled) {
          setData(overview);
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
  }, [period]);

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
  const periodName = describePeriod(data.period, data.range).title.toLowerCase();

  return (
    <div className="flex flex-col gap-5">
      <PeriodSummary period={data.period} range={data.range} />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(190px,100%),1fr))] gap-3">
        <KpiCard
          label="Total followers"
          icon={Users}
          value={formatNumber(kpis.totalFollowers.current)}
          delta={computeDelta(kpis.totalFollowers)}
        />
        <KpiCard
          label="New followers"
          icon={UserPlus}
          value={formatNumber(kpis.newFollowers.current)}
          delta={computeDelta(kpis.newFollowers)}
        />
        <KpiCard
          label="Revenue"
          icon={Banknote}
          value={formatBaht(kpis.revenue.current)}
          delta={computeDelta(kpis.revenue)}
        />
        <KpiCard
          label="Orders"
          icon={ShoppingBag}
          value={formatNumber(kpis.orders.current)}
          delta={computeDelta(kpis.orders)}
          note="paid"
        />
        <KpiCard
          label="Messages delivered"
          icon={Send}
          value={formatNumber(kpis.messagesDelivered.current)}
          delta={computeDelta(kpis.messagesDelivered)}
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <GrowthTrendChart
          data={data.trend}
          rangeEnd={data.range.end}
          periodName={periodName}
        />
        <PurchaseFunnel funnel={data.funnel} />
      </div>

      <div className="flex flex-wrap gap-4">
        <RecentBroadcastTable broadcasts={data.recentBroadcasts} />
        <TopProducts products={data.topProducts} />
      </div>
    </div>
  );
}
