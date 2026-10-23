"use client";

import { useState } from "react";
import { LineUser, UserStatus, UserTier } from "../types";
import { Check, Copy } from "lucide-react";
import { CustomerTagList } from "./customer-tag-badge";

interface LineUserTableProps {
  users: LineUser[];
  startIndex?: number;
  /** Opens the points dialog for a user. */
  onOpenPoints?: (user: LineUser) => void;
}

function maskLineUserId(lineUserId: string): string {
  if (lineUserId.length <= 12) return lineUserId;
  return `${lineUserId.slice(0, 5)}…${lineUserId.slice(-5)}`;
}

function LineUserIdCopy({ lineUserId }: { lineUserId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(lineUserId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — full ID is still shown in the tooltip.
    }
  };

  return (
    <div className="flex items-center gap-1">
      <span
        className="text-xs font-mono text-gray-500 dark:text-gray-400"
        title={lineUserId}
      >
        {maskLineUserId(lineUserId)}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded transition-colors"
        title={copied ? "Copied" : "Copy LINE user ID"}
        aria-label="Copy LINE user ID"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}

function formatDateTime(date: Date): string {
  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${datePart} ${timePart}`;
}

function StatusBadge({ status }: { status: UserStatus }) {
  const statusStyles: Record<UserStatus, string> = {
    Active: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    Blocked: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    Unfollowed:
      "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400",
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

export function UserTypeBadge({ userType }: { userType: string }) {
  const typeStyles: Record<string, string> = {
    Member: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
    Guest: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${typeStyles[userType] || typeStyles.Guest}`}
    >
      {userType}
    </span>
  );
}

export function UserTierBadge({ userTier }: { userTier: UserTier | null }) {
  if (!userTier) {
    return (
      <span className="text-xs text-gray-500 dark:text-gray-400">—</span>
    );
  }

  const tierStyles: Record<UserTier, string> = {
    [UserTier.Silver]:
      "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    [UserTier.Gold]:
      "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300",
    [UserTier.Platinum]:
      "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${tierStyles[userTier]}`}
    >
      {userTier}
    </span>
  );
}

export function LineUserTable({
  users,
  startIndex = 0,
  onOpenPoints,
}: LineUserTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-16">
                No.
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Display Name
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                User Type
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                User Tier
              </th>
              <th className="px-4 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Points
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Tags
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Last Active
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Date Added
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {startIndex + index + 1}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar && (
                        <img
                          src={user.avatar}
                          alt={user.displayName}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {user.displayName}
                        </p>
                        <LineUserIdCopy lineUserId={user.lineUserId} />
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <UserTypeBadge userType={user.userType} />
                  </td>

                  <td className="px-4 py-4">
                    <UserTierBadge userTier={user.userTier} />
                  </td>

                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onOpenPoints?.(user)}
                      disabled={!onOpenPoints}
                      className="text-sm font-medium tabular-nums text-blue-600 hover:underline disabled:text-gray-700 disabled:no-underline dark:text-blue-400 dark:disabled:text-gray-300"
                      title="View and adjust points"
                    >
                      {user.points.toLocaleString()}
                    </button>
                  </td>

                  <td className="px-4 py-4">
                    <StatusBadge status={user.status} />
                  </td>

                  <td className="px-4 py-4">
                    <CustomerTagList tags={user.tags} />
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {formatDateTime(user.lastActive)}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {formatDateTime(user.dateAdded)}
                    </p>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No users found. Try adjusting your search filters.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
