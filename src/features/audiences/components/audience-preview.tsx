"use client";

import { useEffect, useState } from "react";
import { Loader2, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAudiencePreview } from "@/features/audiences/lib/api";
import {
  AudienceCriteria,
  AudiencePreviewUser,
  AudienceSegmentType,
} from "@/features/audiences/types";

const PREVIEW_LIMIT = 10;
const PREVIEW_DEBOUNCE_MS = 400;

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface AudiencePreviewProps {
  type: AudienceSegmentType;
  criteria: AudienceCriteria;
  /** False when the current rules cannot match anyone yet. */
  enabled: boolean;
  totalCount: number;
}

export function AudiencePreview({
  type,
  criteria,
  enabled,
  totalCount,
}: AudiencePreviewProps) {
  const requestKey = `${type}:${JSON.stringify(criteria)}`;
  // Result tagged with the request it answers; a stale tag means loading.
  const [result, setResult] = useState<{
    key: string;
    users: AudiencePreviewUser[];
    error: string | null;
  } | null>(null);

  const isLoading = enabled && result?.key !== requestKey;
  const users = enabled ? (result?.users ?? []) : [];
  const error = enabled && !isLoading ? (result?.error ?? null) : null;

  useEffect(() => {
    if (!enabled) return;

    let isCancelled = false;
    const timer = setTimeout(async () => {
      try {
        const preview = await fetchAudiencePreview(
          type,
          criteria,
          PREVIEW_LIMIT,
        );
        if (!isCancelled) {
          setResult({ key: requestKey, users: preview.users, error: null });
        }
      } catch (err) {
        if (!isCancelled) {
          setResult({
            key: requestKey,
            users: [],
            error:
              err instanceof Error ? err.message : "Failed to load preview",
          });
        }
      }
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
    // requestKey stands in for the criteria object identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, requestKey]);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
            Sample members
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Users matching the current rules, most recently active first
          </p>
        </div>
        {isLoading && users.length > 0 && (
          <Loader2 className="mt-1 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {isLoading && users.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="rounded-lg border border-dashed border-red-300 p-4 text-sm text-red-500 dark:border-red-800 dark:text-red-400">
          {error}
        </p>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
          <Users className="h-5 w-5" />
          {enabled
            ? "No users match these rules yet"
            : "Choose targeting rules to see matching users"}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  <th className="pb-2 pr-4 font-medium">User</th>
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 pr-4 font-medium">Tier</th>
                  <th className="pb-2 pr-4 font-medium">Followed</th>
                  <th className="pb-2 font-medium">Last active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <Avatar size="sm">
                          {user.pictureUrl && (
                            <AvatarImage src={user.pictureUrl} alt="" />
                          )}
                          <AvatarFallback>
                            {(user.displayName ?? "?").charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate font-medium text-gray-900 dark:text-white">
                          {user.displayName ?? "Unknown user"}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 pr-4">
                      <Badge variant="outline">{user.userType}</Badge>
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                      {user.userTier ?? "—"}
                    </td>
                    <td className="whitespace-nowrap py-2 pr-4 text-gray-500 dark:text-gray-400">
                      {formatDate(user.followedAt)}
                    </td>
                    <td className="whitespace-nowrap py-2 text-gray-500 dark:text-gray-400">
                      {formatDate(user.lastActivity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Showing {users.length.toLocaleString()} of{" "}
            {Math.max(totalCount, users.length).toLocaleString()} matching
            users
          </p>
        </>
      )}
    </section>
  );
}
