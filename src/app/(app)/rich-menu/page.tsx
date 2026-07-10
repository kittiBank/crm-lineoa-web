"use client";

import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { Button } from "@/components/ui/button";

/**
 * Rich Menu page
 * Manage LINE Rich Menu configurations
 */
export default function RichMenuPage() {
  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Rich Menu", isActive: true },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Rich Menu
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create and manage LINE Rich Menu configurations
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Rich Menu management tools will be available here
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Create Rich Menu
          </Button>
        </div>
      </div>
    </div>
  );
}
