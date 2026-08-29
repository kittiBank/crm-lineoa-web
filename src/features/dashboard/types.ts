export type DashboardPeriod = "today" | "7d" | "month";

export const DASHBOARD_PERIOD_OPTIONS: Array<{
  value: DashboardPeriod;
  label: string;
}> = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "month", label: "This month" },
];

export type DashboardBroadcastStatus =
  | "Sent"
  | "In Progress"
  | "Scheduled"
  | "Draft"
  | "Failed";

export interface DashboardMetrics {
  totalAudience: number;
  activeBroadcasts: number;
  messageSentToday: number;
}

export interface FollowerStatus {
  active: number;
  inactive: number;
}

export interface BroadcastTrendData {
  day: string;
  sent: number;
  delivered: number;
}

export interface BroadcastStatusData {
  name: DashboardBroadcastStatus;
  value: number;
  fill: string;
}

export interface RecentBroadcast {
  id: string;
  campaign: string;
  description: string | null;
  status: DashboardBroadcastStatus;
  sent: number;
  delivered: number;
  deliveredRate: number;
  date: string;
}

export interface DashboardOverview {
  metrics: DashboardMetrics;
  followers: FollowerStatus;
  broadcastTrend: BroadcastTrendData[];
  broadcastStatus: BroadcastStatusData[];
  recentBroadcasts: RecentBroadcast[];
}

export const BROADCAST_STATUS_COLORS: Record<DashboardBroadcastStatus, string> =
  {
    Sent: "#3b82f6",
    "In Progress": "#f59e0b",
    Scheduled: "#10b981",
    Draft: "#9ca3af",
    Failed: "#ef4444",
  };
