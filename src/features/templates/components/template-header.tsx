import { Plus, Trash2, Edit2, Eye } from "lucide-react";
import Link from "next/link";
import { MessageTemplate } from "../types";

interface TemplateHeaderProps {
  title?: string;
  description?: string;
}

/**
 * Template header component
 * Displays title, description, and new template button
 */
export function TemplateHeader({
  title = "Message Templates",
  description = "Create and manage reusable message templates for your broadcasts",
}: TemplateHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-2">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
          {description}
        </p>
      </div>

      {/* New Template Button */}
      <Link href="/templates/create">
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors active:scale-95">
          <Plus className="w-5 h-5" />
          New Template
        </button>
      </Link>
    </div>
  );
}
