"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { agentLabel, formatDate } from "../lib/format";
import {
  Conversation,
  ConversationStatus,
  InboxAgent,
  STATUS_LABELS,
} from "../types";

const selectClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

interface ConversationDetailsProps {
  conversation: Conversation;
  agents: InboxAgent[];
  currentUserId: string | null;
  canManage: boolean;
  isUpdating: boolean;
  onUpdate: (payload: {
    status?: ConversationStatus;
    assigneeId?: string | null;
  }) => void;
}

export function ConversationDetails({
  conversation,
  agents,
  currentUserId,
  canManage,
  isUpdating,
  onUpdate,
}: ConversationDetailsProps) {
  const { lineUser } = conversation;
  const name = lineUser.displayName ?? "Unknown user";
  const isBlocked = lineUser.status !== "following";

  const rows: [string, string][] = [
    ["Type", lineUser.userType],
    ["Tier", lineUser.userTier ?? "—"],
    ["Phone", lineUser.phone ?? "—"],
    ["Followed", formatDate(lineUser.followedAt)],
    ["Last active", formatDate(lineUser.lastActivity)],
  ];

  return (
    <div className="h-full space-y-6 overflow-y-auto p-4">
      <div className="flex flex-col items-center text-center">
        <Avatar className="size-16">
          {lineUser.pictureUrl && <AvatarImage src={lineUser.pictureUrl} alt="" />}
          <AvatarFallback className="text-lg">{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <p className="mt-2 font-semibold text-gray-900 dark:text-white">{name}</p>
        {isBlocked && (
          <Badge variant="destructive" className="mt-1">
            Blocked the OA
          </Badge>
        )}
      </div>

      <dl className="space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className="text-right font-medium text-gray-900 dark:text-white">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="space-y-4 border-t border-gray-200 pt-4 dark:border-gray-700">
        <div>
          <label
            htmlFor="inbox-assignee"
            className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            Assigned agent
          </label>
          <select
            id="inbox-assignee"
            value={conversation.assignee?.id ?? ""}
            onChange={(event) =>
              onUpdate({ assigneeId: event.target.value || null })
            }
            disabled={!canManage || isUpdating}
            className={selectClassName}
          >
            <option value="">Unassigned</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agentLabel(agent)}
                {agent.id === currentUserId ? " (you)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="inbox-status"
            className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            Status
          </label>
          <select
            id="inbox-status"
            value={conversation.status}
            onChange={(event) =>
              onUpdate({ status: event.target.value as ConversationStatus })
            }
            disabled={!canManage || isUpdating}
            className={selectClassName}
          >
            {(Object.keys(STATUS_LABELS) as ConversationStatus[]).map(
              (status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ),
            )}
          </select>
        </div>

        {!canManage && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Only {conversation.assignee ? agentLabel(conversation.assignee) : "the assignee"}{" "}
            or an admin can change this conversation.
          </p>
        )}
      </div>
    </div>
  );
}
