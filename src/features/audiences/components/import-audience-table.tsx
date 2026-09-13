import { UserTier } from "@/constants/user-tier";
import {
  UserTierImportRow,
  UserTierImportStatus,
} from "../lib/parse-user-tier-file";

const TIER_STYLES: Record<UserTier, string> = {
  [UserTier.Silver]:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  [UserTier.Gold]:
    "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  [UserTier.Platinum]:
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300",
};

const STATUS_LABELS: Record<UserTierImportStatus, string> = {
  ready: "Ready",
  invalid_tier: "Invalid tier",
  missing_line_user_id: "Missing LINE user ID",
};

interface ImportAudienceTableProps {
  rows: UserTierImportRow[];
  hasImportedFile: boolean;
}

function UserTierBadge({ userTier }: { userTier: UserTier | null }) {
  if (!userTier) {
    return <span className="text-xs text-gray-500 dark:text-gray-400">—</span>;
  }

  return (
    <span
      className={`inline-flex items-center rounded px-2.5 py-1 text-xs font-medium ${TIER_STYLES[userTier]}`}
    >
      {userTier}
    </span>
  );
}

function StatusBadge({ status }: { status: UserTierImportStatus }) {
  const isReady = status === "ready";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        isReady
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function ImportAudienceTable({
  rows,
  hasImportedFile,
}: ImportAudienceTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                Row
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                LINE User ID
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                User Tier
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {rows.map((row) => (
              <tr
                key={`${row.rowNumber}-${row.lineUserId}`}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {row.rowNumber}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                  {row.lineUserId || "—"}
                </td>
                <td className="px-4 py-3">
                  {row.parsedTier ? (
                    <UserTierBadge userTier={row.parsedTier} />
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {row.userTier || "—"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          {hasImportedFile
            ? "No imported rows match the current filters."
            : "No imported users yet. Click Import Excel to map LINE user tiers."}
        </div>
      ) : null}
    </div>
  );
}
