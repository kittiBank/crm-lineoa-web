"use client";

import { useState, type ReactNode } from "react";
import {
  AtSign,
  Check,
  Copy,
  Hash,
  Loader2,
  MessageCircle,
  Target,
  UserRound,
  UserX,
} from "lucide-react";
import { LineOaInfo } from "../types";

interface LineOaProfileCardProps {
  info: LineOaInfo | null;
  loading?: boolean;
  testing?: boolean;
  verified?: boolean;
}

function formatNumber(value: number | null | undefined) {
  if (value == null) return "—";
  return value.toLocaleString();
}

function CopyValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  if (!value) {
    return (
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-1 text-sm text-gray-400">—</p>
      </div>
    );
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <button
        type="button"
        onClick={() => void copy()}
        className="mt-1 group flex w-full items-center justify-between gap-2 rounded-md bg-gray-50 px-2 py-1.5 text-left font-mono text-xs text-gray-800 hover:bg-gray-100 dark:bg-gray-900/60 dark:text-gray-200 dark:hover:bg-gray-900"
        title="Copy"
      >
        <span className="truncate">{value}</span>
        {copied ? (
          <Check className="h-3.5 w-3.5 shrink-0 text-green-600" />
        ) : (
          <Copy className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-gray-600" />
        )}
      </button>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 inline-flex rounded-lg bg-gray-100 p-1.5 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
        {icon}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-0.5 text-lg font-semibold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

export function LineOaProfileCard({
  info,
  loading = false,
  testing = false,
  verified = false,
}: LineOaProfileCardProps) {
  if (loading) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading LINE OA info...
        </div>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 py-10 text-center dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#06C755]/10">
          <MessageCircle className="h-8 w-8 text-[#06C755]" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          LINE OA profile
        </h3>
        <p className="mt-2 max-w-xs text-sm text-gray-500 dark:text-gray-400">
          Test connection to load profile, LINE OA ID, display name, followers,
          and quota from LINE API.
        </p>
      </div>
    );
  }

  const initial = (info.displayName || "L").slice(0, 1).toUpperCase();
  const quotaLimited = info.quotaType === "limited" && info.quotaLimit;
  const quotaPercent =
    quotaLimited && info.quotaLimit
      ? Math.min(100, Math.round(((info.quotaUsed ?? 0) / info.quotaLimit) * 100))
      : 0;
  const quotaRemaining =
    quotaLimited && info.quotaLimit != null
      ? Math.max(0, info.quotaLimit - (info.quotaUsed ?? 0))
      : null;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="bg-gradient-to-br from-[#06C755] to-[#05a847] px-6 pb-6 pt-6 text-white">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm font-medium text-white/90">LINE Official Account</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {verified || testing ? "Live" : "Saved"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {info.pictureUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={info.pictureUrl}
              alt={info.displayName}
              className="h-20 w-20 rounded-2xl border-4 border-white/90 object-cover shadow-md"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white/90 bg-white/15 text-2xl font-bold text-white shadow-md">
              {initial}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="truncate text-xl font-bold text-white">
              {info.displayName || "LINE Official Account"}
            </h3>
            <p className="truncate text-sm text-white/80">
              {info.premiumId || info.basicId || "LINE OA"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {testing && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-200">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Refreshing live data from LINE...
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <StatTile
            icon={<UserRound className="h-4 w-4" />}
            label="Followers"
            value={formatNumber(info.followerCount)}
          />
          <StatTile
            icon={<Target className="h-4 w-4" />}
            label="Reach"
            value={formatNumber(info.targetedReaches)}
          />
          <StatTile
            icon={<UserX className="h-4 w-4" />}
            label="Blocked"
            value={formatNumber(info.blockCount)}
          />
        </div>

        <div className="mt-4 space-y-3">
          <CopyValue label="LINE OA ID" value={info.botUserId} />
          <CopyValue label="Basic ID" value={info.basicId} />
          {info.premiumId ? (
            <CopyValue label="Premium ID" value={info.premiumId} />
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <MessageCircle className="h-3.5 w-3.5" />
              Chat mode
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {info.chatMode === "chat"
                ? "Chat On"
                : info.chatMode === "bot"
                  ? "Bot (Chat Off)"
                  : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Hash className="h-3.5 w-3.5" />
              Mark as read
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {info.markAsReadMode === "auto"
                ? "Auto"
                : info.markAsReadMode === "manual"
                  ? "Manual"
                  : "—"}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Monthly message quota
            </p>
            <p className="text-xs text-gray-500">
              {quotaLimited
                ? `${formatNumber(info.quotaUsed)} / ${formatNumber(info.quotaLimit)}`
                : info.quotaType === "none"
                  ? "Unlimited"
                  : "—"}
            </p>
          </div>
          {quotaLimited ? (
            <>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-[#06C755]"
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Remaining {formatNumber(quotaRemaining)}
              </p>
            </>
          ) : (
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {info.quotaType === "none"
                ? "No monthly cap"
                : "Quota not available"}
            </p>
          )}
        </div>

        {info.infoSyncedAt && (
          <p className="mt-4 flex items-center gap-1.5 text-[11px] text-gray-400">
            <AtSign className="h-3 w-3" />
            Synced {new Date(info.infoSyncedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
