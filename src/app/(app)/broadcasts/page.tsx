"use client";

import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

/**
 * Broadcasts list page
 * Displays all created broadcasts with options to create, edit, or delete
 */
export default function BroadcastsPage() {
  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Broadcasts", isActive: true },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Broadcasts
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and send broadcast messages to your LINE users
          </p>
        </div>
        <Link href="/broadcasts/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Broadcast
          </Button>
        </Link>
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No broadcasts yet. Create one to get started.
          </p>
          <Link href="/broadcasts/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Create Your First Broadcast
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
