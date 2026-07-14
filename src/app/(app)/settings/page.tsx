"use client";

import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";

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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        {/* Channel Access Token */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Channel Access Token
          </label>
          <input
            type="password"
            placeholder="Enter your channel access token"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Get this from LINE Developers console
          </p>
        </div>

        {/* Channel Secret */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Channel Secret
          </label>
          <input
            type="password"
            placeholder="Enter your channel secret"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Keep this secret safe
          </p>
        </div>

        {/* Webhook URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Webhook URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value="https://your-domain.com/webhook/line"
              readOnly
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
            />
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
