"use client";

import { LineUser, UserStatus } from "../types";
import { Eye, MoreVertical } from "lucide-react";

interface LineUserTableProps {
  users: LineUser[];
  startIndex?: number;
  onView?: (id: string) => void;
  onMore?: (id: string) => void;
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

function UserTypeBadge({ userType }: { userType: string }) {
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

export function LineUserTable({
  users,
  startIndex = 0,
  onView,
  onMore,
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
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Actions
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
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.lineUserId}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <UserTypeBadge userType={user.userType} />
                  </td>

                  <td className="px-4 py-4">
                    <StatusBadge status={user.status} />
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.tags.length > 0 ? (
                        user.tags.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          No tags
                        </span>
                      )}
                      {user.tags.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          +{user.tags.length - 2}
                        </span>
                      )}
                    </div>
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

                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onView?.(user.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="View user"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onMore?.(user.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="More options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center">
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
