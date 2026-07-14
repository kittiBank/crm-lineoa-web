"use client";

import { useState, useMemo } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import {
  BroadcastTrendChart,
  AudienceGrowthChart,
  RecentBroadcastTable,
} from "@/features/dashboard/components";
import {
  generateDashboardMetrics,
  generateBroadcastTrendData,
  generateAudienceGrowthData,
  generateRecentBroadcasts,
} from "@/features/dashboard/lib/mockData";
import { Users, Radio, Send } from "lucide-react";

/**
 * Dashboard page
 * Main landing page showing overview and key metrics
 * This is the home page after login
 */
export default function DashboardPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Dashboard", isActive: true },
  ];

  // Generate mock data on client-side to avoid hydration issues
  const [metrics] = useState(() => generateDashboardMetrics());
  const [broadcastTrendData] = useState(() => generateBroadcastTrendData());
  const [audienceGrowthData] = useState(() => generateAudienceGrowthData());
  const [recentBroadcasts] = useState(() => generateRecentBroadcasts(5));

  return (
    <div className="space-y-4" suppressHydrationWarning>
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Overview of your LINE Official Account
        </p>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Audience Card */}
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

        {/* Active Broadcast Card */}
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

        {/* Message Sent Today Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Message Sent Today
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
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Broadcast Trend Chart */}
        <BroadcastTrendChart data={broadcastTrendData} />

        {/* Audience Growth Chart */}
        <AudienceGrowthChart data={audienceGrowthData} />
      </div>

      {/* Recent Broadcasts Table */}
      <RecentBroadcastTable broadcasts={recentBroadcasts} />
    </div>
  );
}
