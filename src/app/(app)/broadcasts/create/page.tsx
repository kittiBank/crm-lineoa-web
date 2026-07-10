"use client";

import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { Button } from "@/components/ui/button";

/**
 * Create Broadcast page
 * Form to create a new broadcast message
 */
export default function CreateBroadcastPage() {
  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Broadcasts", href: "/broadcasts" },
    { label: "Create", isActive: true },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create New Broadcast
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Set up a new broadcast message to send to your LINE users
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        {/* Broadcast Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Broadcast Title *
          </label>
          <input
            type="text"
            placeholder="e.g., Summer Sale Announcement"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Message Template Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message Template *
          </label>
          <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select a template</option>
            <option value="template1">Template 1</option>
            <option value="template2">Template 2</option>
          </select>
        </div>

        {/* Send Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Send Type *
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="sendType"
                value="immediate"
                defaultChecked
                className="w-4 h-4"
              />
              <span className="text-gray-700 dark:text-gray-300">
                Send Immediately
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="sendType" value="scheduled" className="w-4 h-4" />
              <span className="text-gray-700 dark:text-gray-300">
                Schedule for Later
              </span>
            </label>
          </div>
        </div>

        {/* Scheduled Date/Time (hidden by default) */}
        <div className="hidden">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Schedule Date & Time
          </label>
          <input
            type="datetime-local"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            placeholder="Add notes about this broadcast"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
            Create Broadcast
          </Button>
          <Link href="/broadcasts">
            <Button className="px-6 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white">
              Cancel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
