"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Broadcast } from "../../types";
import { BROADCAST_STATUS_DOT_COLORS } from "../../lib/status-styles";

interface BroadcastChipProps {
  broadcast: Broadcast;
  onSelect: (broadcast: Broadcast) => void;
}

function BroadcastChip({ broadcast, onSelect }: BroadcastChipProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(broadcast)}
      title={broadcast.campaignName}
      className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
    >
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          BROADCAST_STATUS_DOT_COLORS[broadcast.status],
        )}
      />
      <span className="truncate">{broadcast.campaignName}</span>
    </button>
  );
}

interface BroadcastCalendarDayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  broadcasts: Broadcast[];
  maxVisible: number;
  onSelectBroadcast: (broadcast: Broadcast) => void;
}

export function BroadcastCalendarDayCell({
  date,
  isCurrentMonth,
  isToday,
  broadcasts,
  maxVisible,
  onSelectBroadcast,
}: BroadcastCalendarDayCellProps) {
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  const visible = broadcasts.slice(0, maxVisible);
  const overflow = broadcasts.slice(maxVisible);

  const handleSelectFromOverflow = (broadcast: Broadcast) => {
    setIsOverflowOpen(false);
    onSelectBroadcast(broadcast);
  };

  return (
    <div
      className={cn(
        "flex min-h-[112px] flex-col gap-1 border-b border-r border-gray-200 p-1.5 last:border-r-0 dark:border-gray-700",
        !isCurrentMonth && "bg-gray-50 dark:bg-gray-900/40",
      )}
    >
      <span
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium",
          isToday
            ? "bg-blue-600 text-white"
            : isCurrentMonth
              ? "text-gray-900 dark:text-white"
              : "text-gray-400 dark:text-gray-600",
        )}
      >
        {date.getDate()}
      </span>

      <div className="flex flex-1 flex-col gap-1 overflow-hidden">
        {visible.map((broadcast) => (
          <BroadcastChip
            key={broadcast.id}
            broadcast={broadcast}
            onSelect={onSelectBroadcast}
          />
        ))}

        {overflow.length > 0 && (
          <Popover open={isOverflowOpen} onOpenChange={setIsOverflowOpen}>
            <PopoverTrigger className="w-full rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
              +{overflow.length} more...
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64">
              <p
                className="mb-2 text-xs font-semibold text-muted-foreground"
                suppressHydrationWarning
              >
                {date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
                {broadcasts.map((broadcast) => (
                  <BroadcastChip
                    key={broadcast.id}
                    broadcast={broadcast}
                    onSelect={handleSelectFromOverflow}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
