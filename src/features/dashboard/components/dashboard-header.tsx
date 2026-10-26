import Link from "next/link";
import { BarChart3, Megaphone, ShoppingBag, Users } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { cn } from "@/lib/utils";
import {
  DASHBOARD_PERIOD_OPTIONS,
  DashboardPeriod,
  DashboardTab,
} from "../types";

const BREADCRUMB_ITEMS = [
  { label: "Home", href: "/dashboard" },
  { label: "Dashboard", isActive: true },
];

export const DASHBOARD_TABS: Array<{
  value: DashboardTab;
  label: string;
  icon: typeof Users;
  /** Tabs still in development (#66–#68) render disabled. */
  ready: boolean;
}> = [
    { value: "overview", label: "Overview", icon: BarChart3, ready: true },
    { value: "users", label: "Users", icon: Users, ready: false },
    { value: "sales", label: "Sales", icon: ShoppingBag, ready: false },
    { value: "broadcasts", label: "Broadcasts", icon: Megaphone, ready: false },
  ];

interface DashboardHeaderProps {
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
}

export function DashboardHeader({ period, onPeriodChange }: DashboardHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1.5">
        <Breadcrumbs items={BREADCRUMB_ITEMS} />
        <h1 className="text-[28px] font-bold tracking-tight text-neutral-950 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Overview of your LINE Official Account
        </p>
      </div>

      <div
        role="group"
        aria-label="Date range"
        className="flex gap-0.5 rounded-[10px] bg-neutral-100 p-[3px] dark:bg-neutral-800"
      >
        {DASHBOARD_PERIOD_OPTIONS.map((option) => {
          const active = option.value === period;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onPeriodChange(option.value)}
              className={cn(
                "min-h-9 rounded-lg px-3.5 text-[13px] font-semibold transition-colors",
                active
                  ? "bg-white text-neutral-950 shadow-sm dark:bg-neutral-950 dark:text-white"
                  : "text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardTabs({ active }: { active: DashboardTab }) {
  return (
    <nav
      aria-label="Dashboard sections"
      className="flex gap-1 overflow-x-auto border-b border-neutral-200 dark:border-neutral-800"
    >
      {DASHBOARD_TABS.map((tab) => {
        const isActive = tab.value === active;
        const className = cn(
          "-mb-px flex min-h-11 items-center gap-2 whitespace-nowrap border-b-2 px-3.5 text-sm font-semibold",
          isActive
            ? "border-[#06C755] text-neutral-950 dark:text-white"
            : "border-transparent text-neutral-500 dark:text-neutral-400",
        );
        const content = (
          <>
            <tab.icon className="size-4" />
            {tab.label}
          </>
        );

        if (!tab.ready) {
          return (
            <span
              key={tab.value}
              aria-disabled="true"
              className={cn(className, "cursor-not-allowed opacity-50")}
            >
              {content}
              <span className="rounded-full bg-neutral-100 px-1.5 py-px text-[10px] font-medium dark:bg-neutral-800">
                Soon
              </span>
            </span>
          );
        }

        return (
          <Link
            key={tab.value}
            href={`/dashboard?tab=${tab.value}`}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={cn(className, !isActive && "hover:text-neutral-950 dark:hover:text-white")}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
