import { Edit2, Trash2, Eye } from "lucide-react";
import { AutoMessage, AutoMessageMatchType, MATCH_TYPE_OPTIONS } from "../types";

interface AutoMessageTableProps {
  items: AutoMessage[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

function MatchTypeBadge({ matchType }: { matchType: AutoMessageMatchType }) {
  const colors: Record<AutoMessageMatchType, string> = {
    exact: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    contains:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
    starts_with:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    ends_with:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  };

  const label =
    MATCH_TYPE_OPTIONS.find((opt) => opt.value === matchType)?.label ??
    matchType;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors[matchType]}`}
    >
      {label}
    </span>
  );
}

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

export function AutoMessageTable({
  items,
  onEdit,
  onDelete,
  onView,
}: AutoMessageTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No auto messages found. Create one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="w-[22%] px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="w-[14%] px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Keyword
              </th>
              <th className="w-[14%] px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Match Type
              </th>
              <th className="w-[16%] px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Template
              </th>
              <th className="w-[8%] px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Priority
              </th>
              <th className="w-[10%] px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="w-[10%] px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Created
              </th>
              <th className="w-[6%] px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white break-words">
                    {item.name}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900 dark:text-white break-words">
                    {item.keyword}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <MatchTypeBadge matchType={item.matchType} />
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900 dark:text-white break-words">
                    {item.template?.name ?? "-"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge isActive={item.isActive} />
                </td>
                <td className="px-6 py-4">
                  <span
                    className="text-sm text-gray-600 dark:text-gray-400"
                    suppressHydrationWarning
                  >
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onView?.(item.id)}
                      className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit?.(item.id)}
                      className="p-2 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete?.(item.id)}
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
