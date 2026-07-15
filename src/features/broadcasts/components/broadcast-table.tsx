import { Broadcast, BroadcastStatus } from "../types";
import { Edit2, Trash2, MoreVertical } from "lucide-react";

interface BroadcastTableProps {
  broadcasts: Broadcast[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * Status badge component with color coding
 */
function StatusBadge({ status }: { status: BroadcastStatus }) {
  const statusStyles: Record<BroadcastStatus, string> = {
    Sent: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    Scheduled:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    Draft: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400",
    Failed: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status]}`}
    >
      <span className="w-2 h-2 rounded-full bg-current mr-2" />
      {status}
    </span>
  );
}

/**
 * Broadcast table component
 * Displays list of broadcasts with detailed information
 */
export function BroadcastTable({
  broadcasts,
  onEdit,
  onDelete,
}: BroadcastTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Table Header */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Campaign Name
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Target Audience
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Template
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {broadcasts.map((broadcast) => (
              <tr
                key={broadcast.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {/* Campaign Name */}
                <td className="px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {broadcast.campaignName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Created{" "}
                      {broadcast.createdAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </td>

                {/* Target Audience */}
                <td className="px-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {broadcast.targetAudience}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ({broadcast.audienceCount.toLocaleString()} users)
                    </p>
                  </div>
                </td>

                {/* Template */}
                <td className="px-4 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    {broadcast.template.name}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <StatusBadge status={broadcast.status} />
                </td>

                {/* Performance */}
                <td className="px-4 py-4">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">
                        {broadcast.performance.delivered}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Delivered
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">
                        {broadcast.performance.readRate}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Read
                      </p>
                    </div>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit?.(broadcast.id)}
                      className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete?.(broadcast.id)}
                      className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {broadcasts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No broadcasts found
          </p>
          <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
            Create your first broadcast
          </button>
        </div>
      )}
    </div>
  );
}
