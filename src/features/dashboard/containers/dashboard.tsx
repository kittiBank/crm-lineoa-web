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
import { BroadcastsTab } from "./broadcasts-tab";
import { OverviewTab } from "./overview-tab";
import { SalesTab } from "./sales-tab";
import { UsersTab } from "./users-tab";

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
      <DashboardHeader tab={tab} period={period} onPeriodChange={setPeriod} />
      <DashboardTabs active={tab} />

      {tab === "overview" && <OverviewTab period={period} />}
      {tab === "users" && <UsersTab period={period} />}
      {tab === "sales" && <SalesTab period={period} />}
      {tab === "broadcasts" && <BroadcastsTab period={period} />}
    </div>
  );
}
