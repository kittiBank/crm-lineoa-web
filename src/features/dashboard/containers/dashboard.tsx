"use client";

import { useEffect, useState } from "react";
import { Radio, Send, UserCheck, Users } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import {
  BroadcastStatusChart,
  BroadcastTrendChart,
  DashboardSkeleton,
  RecentBroadcastTable,
} from "@/features/dashboard/components";
import { fetchDashboardOverview } from "@/features/dashboard/lib/api";
import {
  BroadcastStatusData,
  BroadcastTrendData,
  DASHBOARD_PERIOD_OPTIONS,
  DashboardMetrics,
  DashboardPeriod,
  FollowerStatus,
  RecentBroadcast,
} from "@/features/dashboard/types";

const EMPTY_METRICS: DashboardMetrics = {
  totalAudience: 0,
  activeBroadcasts: 0,
  messageSentToday: 0,
};

const EMPTY_FOLLOWERS: FollowerStatus = {
  active: 0,
  inactive: 0,
};

function messagesSentLabel(period: DashboardPeriod): string {
  return period === "today" ? "Message Sent Today" : "Messages Sent";
}

export function DashboardContainer() {
  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Dashboard", isActive: true },
  ];

  const [period, setPeriod] = useState<DashboardPeriod>("today");
  const [metrics, setMetrics] = useState<DashboardMetrics>(EMPTY_METRICS);
  const [followers, setFollowers] = useState<FollowerStatus>(EMPTY_FOLLOWERS);
  const [broadcastTrend, setBroadcastTrend] = useState<BroadcastTrendData[]>(
    [],
  );
  const [broadcastStatus, setBroadcastStatus] = useState<BroadcastStatusData[]>(
    [],
  );
  const [recentBroadcasts, setRecentBroadcasts] = useState<RecentBroadcast[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchDashboardOverview(period);
        if (cancelled) {
          return;
        }

        setMetrics(data.metrics);
        setFollowers(data.followers);
        setBroadcastTrend(data.broadcastTrend);
        setBroadcastStatus(data.broadcastStatus);
        setRecentBroadcasts(data.recentBroadcasts);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load dashboard",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [period]);

  if (isLoading) {
    return <DashboardSkeleton />;
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

  const totalFollowers = followers.active + followers.inactive;

  return (
    <div className="space-y-4">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of your LINE Official Account
          </p>
        </div>
        {/* Select Dashboard date range */}
        <select
          aria-label="Dashboard date range"
          value={period}
          onChange={(event) =>
            setPeriod(event.target.value as DashboardPeriod)
          }
          className="w-full sm:w-auto text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {DASHBOARD_PERIOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Total Audience
              </p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {metrics.totalAudience.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Active Broadcast
              </p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {metrics.activeBroadcasts}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {metrics.activeBroadcasts} scheduled
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Radio className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {messagesSentLabel(period)}
              </p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {metrics.messageSentToday.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Send className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Followers OA
              </p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {totalFollowers.toLocaleString()}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-green-600 dark:text-green-400">
                  Active: {followers.active.toLocaleString()}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Inactive: {followers.inactive.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <BroadcastTrendChart data={broadcastTrend} />
        </div>
        <BroadcastStatusChart data={broadcastStatus} />
      </div>

      <RecentBroadcastTable broadcasts={recentBroadcasts} />
    </div>
  );
}
