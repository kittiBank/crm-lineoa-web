"use client";

import { LayoutList, CalendarDays } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BroadcastViewMode } from "../types";

interface BroadcastViewToggleProps {
  value: BroadcastViewMode;
  onValueChange: (value: BroadcastViewMode) => void;
}

// Match the SearchFilters "Search" button color for the active tab, sized like
// the broadcast view page's Details / Performance tabs.
const ACTIVE_TAB_CLASSES =
  "px-4 has-data-[icon=inline-start]:pl-3 data-active:bg-blue-600 data-active:text-white dark:data-active:border-transparent dark:data-active:bg-blue-600 dark:data-active:text-white";

/**
 * Switches the broadcasts page between the table list and the calendar view.
 */
export function BroadcastViewToggle({
  value,
  onValueChange,
}: BroadcastViewToggleProps) {
  return (
    <div className="flex justify-end">
      <Tabs
        value={value}
        onValueChange={(next) => onValueChange(next as BroadcastViewMode)}
      >
        <TabsList className="p-1 group-data-horizontal/tabs:h-10">
          <TabsTrigger value="list" className={ACTIVE_TAB_CLASSES}>
            <LayoutList data-icon="inline-start" />
            List
          </TabsTrigger>
          <TabsTrigger value="calendar" className={ACTIVE_TAB_CLASSES}>
            <CalendarDays data-icon="inline-start" />
            Calendar
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
