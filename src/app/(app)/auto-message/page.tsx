"use client";

import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";

/**
 * Auto Message page
 * Placeholder for auto message configuration
 */
export default function AutoMessagePage() {
  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Auto Message", isActive: true },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Auto Message
        </h1>
      </div>
    </div>
  );
}
