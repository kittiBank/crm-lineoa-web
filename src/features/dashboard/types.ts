export type DashboardPeriod = "today" | "7d" | "30d" | "90d";

export const DASHBOARD_PERIOD_OPTIONS: Array<{
  value: DashboardPeriod;
  label: string;
  title: string;
}> = [
    { value: "today", label: "Today", title: "Today" },
    { value: "7d", label: "7D", title: "Last 7 days" },
    { value: "30d", label: "30D", title: "Last 30 days" },
    { value: "90d", label: "90D", title: "Last 90 days" },
  ];

export const DEFAULT_DASHBOARD_PERIOD: DashboardPeriod = "30d";

export type DashboardTab = "overview" | "users" | "sales" | "broadcasts";

export type DashboardBroadcastStatus =
  | "Sent"
  | "In Progress"
  | "Scheduled"
  | "Draft"
  | "Failed";

export interface Comparison {
  current: number;
  previous: number;
}

export interface DashboardRange {
  start: string;
  end: string;
  previousStart: string;
  previousEnd: string;
}

export type GrowthMetric = "newFollowers" | "revenue" | "orders" | "messagesSent";

export type GrowthTotals = Record<GrowthMetric, number>;

export interface GrowthTrendPoint extends GrowthTotals {
  label: string;
  start: string;
  previous: GrowthTotals;
}

export interface PurchaseFunnel {
  attributionWindowHours: number;
  linkClicks: number;
  ordersPlaced: number;
  paid: number;
  revenue: number;
}

export interface RecentBroadcast {
  id: string;
  campaign: string;
  description: string | null;
  status: DashboardBroadcastStatus;
  sent: number;
  delivered: number;
  deliveredRate: number;
  revenue: number;
  date: string;
}

export interface TopProduct {
  productId: string;
  name: string;
  units: number;
  revenue: number;
}

export interface DashboardOverview {
  period: DashboardPeriod;
  granularity: "hour" | "day" | "week";
  range: DashboardRange;
  kpis: {
    totalFollowers: Comparison;
    newFollowers: Comparison;
    revenue: Comparison;
    orders: Comparison;
    messagesDelivered: Comparison;
  };
  trend: GrowthTrendPoint[];
  funnel: PurchaseFunnel;
  recentBroadcasts: RecentBroadcast[];
  topProducts: TopProduct[];
}
