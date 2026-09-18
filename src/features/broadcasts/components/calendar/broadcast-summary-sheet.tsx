"use client";

import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Broadcast } from "../../types";
import { BROADCAST_STATUS_STYLES } from "../../lib/status-styles";
import { getBroadcastCalendarDate } from "../../lib/calendar";

interface BroadcastSummarySheetProps {
  broadcast: Broadcast | null;
  onOpenChange: (open: boolean) => void;
  onView: (id: string) => void;
}

export function BroadcastSummarySheet({
  broadcast,
  onOpenChange,
  onView,
}: BroadcastSummarySheetProps) {
  return (
    <Sheet open={Boolean(broadcast)} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        {broadcast && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    BROADCAST_STATUS_STYLES[broadcast.status],
                  )}
                >
                  {broadcast.status}
                </span>
                <span
                  className="text-xs text-muted-foreground"
                  suppressHydrationWarning
                >
                  {getBroadcastCalendarDate(broadcast).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" },
                  )}
                </span>
              </div>
              <SheetTitle>{broadcast.campaignName}</SheetTitle>
              <SheetDescription suppressHydrationWarning>
                {broadcast.targetAudience} ·{" "}
                {broadcast.audienceCount.toLocaleString()} users
              </SheetDescription>
            </SheetHeader>

            <div className="grid grid-cols-2 gap-4 px-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Template</p>
                <p
                  className="truncate font-medium"
                  title={broadcast.template.name}
                >
                  {broadcast.template.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Delivered</p>
                <p className="font-medium">{broadcast.performance.delivered}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Read Rate</p>
                <p className="font-medium">{broadcast.performance.readRate}%</p>
              </div>
            </div>

            <SheetFooter>
              <Button onClick={() => onView(broadcast.id)}>
                View Broadcast
                <ArrowUpRight data-icon="inline-end" />
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
