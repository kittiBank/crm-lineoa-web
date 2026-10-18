"use client";

import { Inbox, Loader2, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { agentLabel, formatListTime } from "../lib/format";
import {
  ASSIGNEE_FILTERS,
  Conversation,
  ConversationQuery,
  InboxSummary,
  STATUS_LABELS,
  STATUS_TABS,
} from "../types";

const STATUS_DOT: Record<Conversation["status"], string> = {
  OPEN: "bg-green-500",
  PENDING: "bg-amber-500",
  CLOSED: "bg-gray-400",
};

interface ConversationListProps {
  conversations: Conversation[];
  query: ConversationQuery;
  summary: InboxSummary | null;
  selectedId: string | null;
  currentUserId: string | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onQueryChange: (query: ConversationQuery) => void;
  onSelect: (id: string) => void;
  onLoadMore: () => void;
}

export function ConversationList({
  conversations,
  query,
  summary,
  selectedId,
  currentUserId,
  isLoading,
  isLoadingMore,
  hasMore,
  onQueryChange,
  onSelect,
  onLoadMore,
}: ConversationListProps) {
  const tabCount = (status: ConversationQuery["status"]) => {
    if (!summary) return null;
    if (status === "OPEN") return summary.open;
    if (status === "PENDING") return summary.pending;
    if (status === "CLOSED") return summary.closed;
    return null;
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-3 border-b border-gray-200 p-3 dark:border-gray-700">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={query.search}
            onChange={(event) =>
              onQueryChange({ ...query, search: event.target.value })
            }
            placeholder="Search by name"
            className="pl-9"
          />
        </div>

        <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-900">
          {STATUS_TABS.map((tab) => {
            const count = tabCount(tab.value);
            const active = query.status === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onQueryChange({ ...query, status: tab.value })}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                  active
                    ? "bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
                )}
              >
                {tab.label}
                {count !== null && (
                  <span className="text-[10px] text-gray-400">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        <select
          value={query.assignee}
          onChange={(event) =>
            onQueryChange({
              ...query,
              assignee: event.target.value as ConversationQuery["assignee"],
            })
          }
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          aria-label="Filter by assignee"
        >
          {ASSIGNEE_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
              {option.value === "me" && summary ? ` (${summary.mine})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading && conversations.length === 0 ? (
          <div className="space-y-4 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <Inbox className="h-6 w-6" />
            No conversations found
          </div>
        ) : (
          <ul>
            {conversations.map((conversation) => {
              const name = conversation.lineUser.displayName ?? "Unknown user";
              const isSelected = conversation.id === selectedId;
              const assignee = conversation.assignee;
              return (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.id)}
                    className={cn(
                      "flex w-full gap-3 border-b border-gray-100 px-3 py-3 text-left transition-colors dark:border-gray-700/60",
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-950/30"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/40",
                    )}
                  >
                    <Avatar size="lg">
                      {conversation.lineUser.pictureUrl && (
                        <AvatarImage
                          src={conversation.lineUser.pictureUrl}
                          alt=""
                        />
                      )}
                      <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "truncate text-sm text-gray-900 dark:text-white",
                            conversation.unreadCount > 0
                              ? "font-semibold"
                              : "font-medium",
                          )}
                        >
                          {name}
                        </span>
                        <span className="shrink-0 text-[11px] text-gray-400">
                          {formatListTime(conversation.lastMessageAt)}
                        </span>
                      </span>
                      <span className="mt-0.5 flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {conversation.lastMessagePreview ?? "No messages"}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <span className="shrink-0 rounded-full bg-blue-600 px-1.5 text-[10px] leading-4 font-semibold text-white">
                            {conversation.unreadCount > 99
                              ? "99+"
                              : conversation.unreadCount}
                          </span>
                        )}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-400">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            STATUS_DOT[conversation.status],
                          )}
                        />
                        {STATUS_LABELS[conversation.status]}
                        <span aria-hidden>·</span>
                        <span className="truncate">
                          {assignee
                            ? assignee.id === currentUserId
                              ? "You"
                              : agentLabel(assignee)
                            : "Unassigned"}
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {hasMore && (
          <div className="p-3">
            <button
              type="button"
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700/40"
            >
              {isLoadingMore && <Loader2 className="h-3 w-3 animate-spin" />}
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
