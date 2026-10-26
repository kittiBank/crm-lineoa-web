"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  DASHBOARD_TABS,
  DashboardHeader,
  DashboardTabs,
} from "@/features/dashboard/components";
import {
  DEFAULT_DASHBOARD_PERIOD,
  DashboardPeriod,
  DashboardTab,
} from "@/features/dashboard/types";
import { OverviewTab } from "./overview-tab";

function resolveTab(value: string | null): DashboardTab {
  const tab = DASHBOARD_TABS.find((t) => t.value === value && t.ready);
  return tab?.value ?? "overview";
}

export function DashboardContainer() {
  const tab = resolveTab(useSearchParams().get("tab"));
  // Shared across tabs so switching tab keeps the selected range.
  const [period, setPeriod] = useState<DashboardPeriod>(DEFAULT_DASHBOARD_PERIOD);

  return (
    <div className="flex flex-col gap-5">
      <DashboardHeader period={period} onPeriodChange={setPeriod} />
      <DashboardTabs active={tab} />

      {tab === "overview" && <OverviewTab period={period} />}
    </div>
  );
}
