import { Edit2, Trash2, Eye } from "lucide-react";
import { MessageTemplate } from "../types";

interface TemplateTableProps {
  templates: MessageTemplate[];
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

/**
 * Type badge component
 */
function TypeBadge({ type }: { type: MessageTemplate["type"] }) {
  const typeColors: Record<MessageTemplate["type"], string> = {
    text: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    flex: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
    carousel:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    rich_menu:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${typeColors[type]}`}
    >
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

/**
 * Status badge component
 */
function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
        isActive
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400"
      }`}
    >
      <span className="w-2 h-2 rounded-full bg-current mr-2" />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

/**
 * Template table component
 * Displays list of message templates with pagination
 */
export function TemplateTable({
  templates,
  currentPage,
  totalPages,
  itemsPerPage,
  onEdit,
  onDelete,
  onView,
  onPageChange = () => {},
  onItemsPerPageChange = () => {},
}: TemplateTableProps) {
  if (templates.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No templates found. Create one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Template Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Usage
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {templates.map((template) => (
              <tr
                key={template.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {/* Template Name */}
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {template.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {template.description}
                    </p>
                  </div>
                </td>

                {/* Type */}
                <td className="px-6 py-4">
                  <TypeBadge type={template.type} />
                </td>

                {/* Category */}
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900 dark:text-white">
                    {template.category}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <StatusBadge isActive={template.isActive} />
                </td>

                {/* Usage Count */}
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900 dark:text-white" suppressHydrationWarning>
                    {template.usageCount.toLocaleString()} times
                  </span>
                </td>

                {/* Created Date */}
                <td className="px-6 py-4">
                  <span
                    className="text-sm text-gray-600 dark:text-gray-400"
                    suppressHydrationWarning
                  >
                    {template.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onView?.(template.id)}
                      className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit?.(template.id)}
                      className="p-2 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete?.(template.id)}
                      className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
