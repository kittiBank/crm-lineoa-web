"use client";

import { KeyboardEvent, useRef } from "react";
import { X } from "lucide-react";
import {
  commitKeywordDraft,
  MAX_AUTO_MESSAGE_KEYWORDS,
} from "@/features/auto-message/lib/keywords";

interface KeywordTagInputProps {
  keywords: string[];
  draft: string;
  onChange: (keywords: string[]) => void;
  onDraftChange: (draft: string) => void;
  disabled?: boolean;
  placeholder?: string;
  onReject?: (reason: "duplicate" | "limit") => void;
}

export function KeywordTagInput({
  keywords,
  draft,
  onChange,
  onDraftChange,
  disabled = false,
  placeholder = "Type a keyword and press Enter",
  onReject,
}: KeywordTagInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const commitDraft = (raw: string) => {
    const next = commitKeywordDraft(keywords, raw);
    if (next.keywords !== keywords) {
      onChange(next.keywords);
    }
    if (next.rejected) {
      onReject?.(next.rejected);
    }
    onDraftChange("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;

    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft(draft);
      return;
    }

    if (event.key === "Backspace" && !draft && keywords.length > 0) {
      event.preventDefault();
      onChange(keywords.slice(0, -1));
    }
  };

  const removeKeyword = (index: number) => {
    onChange(keywords.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div
        className={`flex min-h-[42px] w-full flex-wrap items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 dark:border-gray-600 dark:bg-gray-700 ${
          disabled
            ? "cursor-default"
            : "cursor-text focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500"
        }`}
        onClick={() => {
          if (!disabled) inputRef.current?.focus();
        }}
      >
        {keywords.map((keyword, index) => (
          <span
            key={`${keyword}-${index}`}
            className="inline-flex max-w-full items-center gap-1 rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-600 dark:text-gray-100"
          >
            <span className="truncate">{keyword}</span>
            {!disabled && (
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  removeKeyword(index);
                }}
                className="rounded-full p-0.5 text-gray-500 hover:bg-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-500 dark:hover:text-white"
                aria-label={`Remove ${keyword}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
        {!disabled && (
          <input
            ref={inputRef}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => commitDraft(draft)}
            className="min-w-[140px] flex-1 border-0 bg-transparent py-0.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-400"
            placeholder={keywords.length === 0 ? placeholder : ""}
          />
        )}
      </div>
      {!disabled && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {keywords.length}/{MAX_AUTO_MESSAGE_KEYWORDS} keywords · Press Enter to
          add
        </p>
      )}
    </div>
  );
}
