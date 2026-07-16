"use client";

import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { LineAccountForm } from "@/components/line-account-form";

/**
 * LINE OA Settings page
 * Configure LINE Official Account credentials and settings
 */
export default function SettingsPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "LINE OA Settings", isActive: true },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          LINE OA Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Configure your LINE Official Account credentials
        </p>
      </div>

      {/* Settings Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Connect LINE Official Account
          </h2>
          <LineAccountForm />
        </div>
      </div>
    </div>
  );
}
