import { Loader2 } from "lucide-react";
import { AdminUser } from "../types";

interface UsersTableProps {
  users: AdminUser[];
  /** Row number offset of the current page. */
  startIndex: number;
  isLoading: boolean;
}

const headerClassName =
  "px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300";

const ROLE_BADGES: Record<string, { label: string; className: string }> = {
  super_admin: {
    label: "Super admin",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  admin: {
    label: "Admin",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
};

const DEFAULT_ROLE_BADGE =
  "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400";

function RoleBadge({ role }: { role: string }) {
  const badge = ROLE_BADGES[role];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        badge?.className ?? DEFAULT_ROLE_BADGE
      }`}
    >
      {badge?.label ?? role}
    </span>
  );
}

function initialsOf(user: AdminUser) {
  const source = user.name?.trim() || user.email;
  return (
    source
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]!.toUpperCase())
      .join("") || "?"
  );
}

function formatCreatedAt(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function UsersTable({ users, startIndex, isLoading }: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
            <tr>
              <th className={`${headerClassName} w-16`}>No</th>
              <th className={headerClassName}>User</th>
              <th className={headerClassName}>Role</th>
              <th className={headerClassName}>LINE OA</th>
              <th className={headerClassName}>Created</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y divide-gray-200 dark:divide-gray-700 ${
              isLoading ? "opacity-50" : ""
            }`}
          >
            {users.map((user, index) => (
              <tr
                key={user.id}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {startIndex + index + 1}
                </td>
                <td className="max-w-md px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {initialsOf(user)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {user.name?.trim() || "—"}
                      </p>
                      <p
                        className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400"
                        title={user.email}
                      >
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {user.lineAccount ? (
                    user.lineAccount.displayName || user.lineAccount.name
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">
                      ยังไม่ได้ผูก LINE OA
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                  {formatCreatedAt(user.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 ? (
        <div className="flex items-center justify-center px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading users...
            </>
          ) : (
            "No users yet."
          )}
        </div>
      ) : null}
    </div>
  );
}
