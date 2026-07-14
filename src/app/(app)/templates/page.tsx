"use client";

import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

/**
 * Message templates page
 * Manage reusable message templates for broadcasts
 */
export default function TemplatesPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Message Templates", isActive: true },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Message Templates
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create and manage reusable message templates
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No templates yet. Create one to get started.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Create Your First Template
          </Button>
        </div>
      </div>
    </div>
  );
}
