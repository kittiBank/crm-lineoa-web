import { Broadcast } from "../types";

/**
 * The date a broadcast should be plotted on in calendar view.
 * Scheduled broadcasts show on their scheduled date, sent broadcasts on
 * their send date, everything else (draft/failed/processing) on createdAt.
 */
export function getBroadcastCalendarDate(broadcast: Broadcast): Date {
  if (broadcast.status === "Scheduled" && broadcast.scheduledFor) {
    return broadcast.scheduledFor;
  }

  if (broadcast.status === "Sent" && broadcast.sentAt) {
    return broadcast.sentAt;
  }

  return broadcast.createdAt;
}

/**
 * Local (not UTC) yyyy-mm-dd key so day bucketing matches what the calendar
 * grid renders in the viewer's timezone.
 */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface CalendarDayInfo {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Builds a fixed 6-week (42 day) grid for the given month, including the
 * trailing/leading days from the adjacent months needed to fill the grid.
 */
export function buildMonthGrid(monthDate: Date): CalendarDayInfo[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay());
  const todayKey = toDateKey(new Date());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + index,
    );

    return {
      date,
      isCurrentMonth: date.getMonth() === month,
      isToday: toDateKey(date) === todayKey,
    };
  });
}

export function groupBroadcastsByDate(
  broadcasts: Broadcast[],
): Map<string, Broadcast[]> {
  const map = new Map<string, Broadcast[]>();

  for (const broadcast of broadcasts) {
    const key = toDateKey(getBroadcastCalendarDate(broadcast));
    const existing = map.get(key);
    if (existing) {
      existing.push(broadcast);
    } else {
      map.set(key, [broadcast]);
    }
  }

  return map;
}
