"use client";

import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMessageTypeLabel } from "../lib/message-types";
import { TemplateMessageBlock } from "../types/builder";

interface MessageBlockListProps {
  messages: TemplateMessageBlock[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onRemove: (id: string) => void;
  readOnly?: boolean;
}

export function MessageBlockList({
  messages,
  selectedId,
  onSelect,
  onMoveUp,
  onMoveDown,
  onRemove,
  readOnly = false,
}: MessageBlockListProps) {
  if (messages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
        Add a message type above to start building your template.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((message, index) => (
        <div
          key={message.id || `message-block-${index}`}
          className={cn(
            "flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors",
            selectedId === message.id
              ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/20"
              : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800",
          )}
        >
          <button
            type="button"
            onClick={() => onSelect(message.id)}
            className="min-w-0 flex-1 text-left"
          >
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {index + 1}. {getMessageTypeLabel(message.type)}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {getMessageSummary(message)}
            </p>
          </button>

          {!readOnly && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => onMoveUp(message.id)}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-700"
                title="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={index === messages.length - 1}
                onClick={() => onMoveDown(message.id)}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-700"
                title="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onRemove(message.id)}
                className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function getMessageSummary(message: TemplateMessageBlock): string {
  switch (message.type) {
    case "text":
      return message.text || "Empty text message";
    case "image":
      return message.imageUrl || "No image URL";
    case "video":
      return message.videoUrl || "No video URL";
    case "flex":
      return message.title || message.altText;
    case "carousel":
      return `${message.columns.length} columns`;
    default:
      return "";
  }
}
