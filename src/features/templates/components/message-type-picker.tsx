"use client";

import { Image, LayoutTemplate, MessageSquare, PanelsTopLeft, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { MESSAGE_TYPE_OPTIONS } from "../lib/message-types";
import { TemplateMessageType } from "../types/builder";

const iconMap = {
  text: MessageSquare,
  image: Image,
  video: Video,
  flex: LayoutTemplate,
  carousel: PanelsTopLeft,
};

interface MessageTypePickerProps {
  onAdd: (type: TemplateMessageType) => void;
}

export function MessageTypePicker({ onAdd }: MessageTypePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
      {MESSAGE_TYPE_OPTIONS.map((option) => {
        const Icon = iconMap[option.type];

        return (
          <button
            key={option.type}
            type="button"
            onClick={() => onAdd(option.type)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-xl border border-gray-200 bg-white p-3 text-left transition-colors",
              "hover:border-blue-400 hover:bg-blue-50/60 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500 dark:hover:bg-blue-950/20",
            )}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
              <Icon className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                {option.label}
              </span>
              <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                {option.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
