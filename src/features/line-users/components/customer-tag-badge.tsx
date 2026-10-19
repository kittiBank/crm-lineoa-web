"use client";

import {
  CUSTOMER_TAG_DEFINITIONS,
  CUSTOMER_TAG_GROUP_STYLES,
  customerTagLabel,
  customerTagValueDetail,
} from "@/constants/customer-tag";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CustomerTagItem } from "../types";

const MAX_VISIBLE_TAGS = 2;

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** One auto tag, with what it means and when it ends on hover. */
export function CustomerTagBadge({ tag }: { tag: CustomerTagItem }) {
  const definition = CUSTOMER_TAG_DEFINITIONS[tag.key];
  const detail = customerTagValueDetail(tag.key, tag.value);

  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          "inline-flex cursor-default items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
          CUSTOMER_TAG_GROUP_STYLES[definition.group],
        )}
      >
        {customerTagLabel(tag.key, tag.value)}
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-semibold">{definition.label}</p>
        <p>{definition.description}</p>
        {detail && <p className="mt-1">{detail}</p>}
        <p className="mt-1 opacity-75" suppressHydrationWarning>
          Since {formatDate(tag.since)}
          {tag.expiresAt ? ` · Ends ${formatDate(tag.expiresAt)}` : ""}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

/** Table cell: the first tags, then "+N" listing the rest on hover. */
export function CustomerTagList({ tags }: { tags: CustomerTagItem[] }) {
  if (tags.length === 0) {
    return (
      <span className="text-xs text-gray-500 dark:text-gray-400">No tags</span>
    );
  }

  const hidden = tags.slice(MAX_VISIBLE_TAGS);

  return (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
        <CustomerTagBadge key={tag.key} tag={tag} />
      ))}
      {hidden.length > 0 && (
        <Tooltip>
          <TooltipTrigger
            aria-label={`${hidden.length} more tags`}
            className="inline-flex cursor-default items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
          >
            +{hidden.length}
          </TooltipTrigger>
          <TooltipContent>
            <ul className="space-y-0.5">
              {hidden.map((tag) => (
                <li key={tag.key}>{customerTagLabel(tag.key, tag.value)}</li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
