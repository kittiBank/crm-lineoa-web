"use client";

import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";

/**
 * LINE Users page
 * View and manage users synced from LINE Official Account
 */
export default function LineUsersPage() {
  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "LINE Users", isActive: true },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          LINE Users
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View and manage users connected to your LINE Official Account
        </p>
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Users will be synced from your LINE Official Account and displayed
            here
          </p>
        </div>
      </div>
    </div>
  );
}
