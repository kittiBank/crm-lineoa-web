"use client";

import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Overview of your LINE Official Account
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Friends Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            Total Friends
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            0
          </p>
        </div>

        {/* Broadcasts Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            Total Broadcasts
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            0
          </p>
        </div>

        {/* Messages Sent Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            Messages Sent
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            0
          </p>
        </div>

        {/* Failed Messages Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            Failed Messages
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            0
          </p>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 border border-gray-200 dark:border-gray-700 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Dashboard charts and detailed analytics will be displayed here.
        </p>
      </div>
    </div>
  );
}
