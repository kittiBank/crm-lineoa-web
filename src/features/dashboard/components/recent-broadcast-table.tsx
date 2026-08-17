import { RecentBroadcast } from "../types";

interface RecentBroadcastTableProps {
  broadcasts: RecentBroadcast[];
}

function StatusBadge({ status }: { status: RecentBroadcast["status"] }) {
  const statusColors: Record<RecentBroadcast["status"], string> = {
    Sent: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    "In Progress":
      "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    Scheduled:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    Draft: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400",
    Failed: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] ?? statusColors.Draft}`}
    >
      {status}
    </span>
  );
}

function formatBroadcastDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RecentBroadcastTable({
  broadcasts,
}: RecentBroadcastTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Broadcast
        </h3>
        <a
          href="/broadcasts"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
        >
          View All
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Campaign
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Sent
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Delivered
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {broadcasts.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No broadcasts yet
                </td>
              </tr>
            ) : (
              broadcasts.map((broadcast) => (
                <tr
                  key={broadcast.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {broadcast.campaign}
                      </p>
                      {broadcast.description ? (
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                          {broadcast.description}
                        </p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={broadcast.status} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 dark:text-white font-medium">
                      {broadcast.sent.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {broadcast.delivered.toLocaleString()}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {broadcast.deliveredRate}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      {formatBroadcastDate(broadcast.date)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
