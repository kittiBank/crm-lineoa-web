import { formatPoints } from "../lib/rules";
import { POINT_TRANSACTION_LABELS, PointTransaction } from "../types";

interface PointHistoryListProps {
  history: PointTransaction[];
  emptyText?: string;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function PointHistoryList({
  history,
  emptyText = "No point activity yet",
}: PointHistoryListProps) {
  if (history.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {emptyText}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {history.map((entry) => {
        const detail = [
          entry.orderNumber,
          entry.note,
          entry.createdBy ? `by ${entry.createdBy}` : null,
        ]
          .filter(Boolean)
          .join(" · ");

        return (
          <li
            key={entry.id}
            className="flex items-start justify-between gap-3 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {POINT_TRANSACTION_LABELS[entry.type] ?? entry.type}
              </p>
              {detail && (
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {detail}
                </p>
              )}
              <p className="text-xs text-gray-400">
                {dateFormatter.format(new Date(entry.createdAt))}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p
                className={`text-sm font-semibold ${
                  entry.points > 0
                    ? "text-[#06C755]"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {entry.points > 0 ? "+" : ""}
                {formatPoints(entry.points)}
              </p>
              <p className="text-xs text-gray-400">
                Bal. {formatPoints(entry.balanceAfter)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
