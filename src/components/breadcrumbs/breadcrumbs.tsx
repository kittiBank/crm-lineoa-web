"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BreadcrumbItem } from "@/types";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumbs component for navigation context
 * Shows the current page location in the hierarchy
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {/* Render link if href is provided and item is not active */}
            {item.href && !item.isActive ? (
              <Link
                href={item.href}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  item.isActive
                    ? "text-gray-900 font-medium dark:text-white"
                    : "text-gray-600 dark:text-gray-400"
                }
              >
                {item.label}
              </span>
            )}

            {/* Show separator except on last item */}
            {index < items.length - 1 && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
