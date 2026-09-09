"use client";

import { MERGE_TAG_DEFINITIONS } from "../lib/merge-tags";

interface MergeTagPickerProps {
  disabled?: boolean;
  onInsert: (tag: string) => void;
}

export function MergeTagPicker({ disabled, onInsert }: MergeTagPickerProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Merge tags
      </p>
      <div className="flex flex-wrap gap-1.5">
        {MERGE_TAG_DEFINITIONS.map((tag) => (
          <button
            key={tag.key}
            type="button"
            disabled={disabled}
            title={tag.description}
            onClick={() => onInsert(`{${tag.key}}`)}
            className="rounded-full border border-gray-300 bg-white px-2.5 py-1 font-mono text-xs text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:border-blue-400 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
          >
            {`{${tag.key}}`}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Replaced from LINE user data when sent, for example สวัสดีคุณ{" "}
        {"{lineUser}"}. Preview shows placeholders such as [Line user].
      </p>
    </div>
  );
}
