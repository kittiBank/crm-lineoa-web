"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Broadcast } from "../../types";
import {
  buildMonthGrid,
  groupBroadcastsByDate,
  toDateKey,
} from "../../lib/calendar";
import { BroadcastCalendarDayCell } from "./broadcast-calendar-day-cell";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_VISIBLE_PER_DAY = 3;

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

interface BroadcastCalendarProps {
  broadcasts: Broadcast[];
  onSelectBroadcast: (broadcast: Broadcast) => void;
}

export function BroadcastCalendar({
  broadcasts,
  onSelectBroadcast,
}: BroadcastCalendarProps) {
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));

  const grid = useMemo(() => buildMonthGrid(monthCursor), [monthCursor]);
  const broadcastsByDate = useMemo(
    () => groupBroadcastsByDate(broadcasts),
    [broadcasts],
  );

  const monthLabel = monthCursor.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const goToPrevMonth = () =>
    setMonthCursor(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  const goToNextMonth = () =>
    setMonthCursor(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
  const goToToday = () => setMonthCursor(startOfMonth(new Date()));

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-200 p-3 dark:border-gray-700">
        <h2
          className="text-sm font-semibold text-gray-900 dark:text-white"
          suppressHydrationWarning
        >
          {monthLabel}
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={goToPrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {grid.map((day) => {
          const key = toDateKey(day.date);
          return (
            <BroadcastCalendarDayCell
              key={key}
              date={day.date}
              isCurrentMonth={day.isCurrentMonth}
              isToday={day.isToday}
              broadcasts={broadcastsByDate.get(key) ?? []}
              maxVisible={MAX_VISIBLE_PER_DAY}
              onSelectBroadcast={onSelectBroadcast}
            />
          );
        })}
      </div>
    </div>
  );
}
