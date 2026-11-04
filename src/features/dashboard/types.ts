import type { CustomerTag } from "@/constants/customer-tag";


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

// ── Users tab ────────────────────────────────────────────────────────────

export type DashboardUserType = "Member" | "Guest";
/** `blocked` = unfollowed or blocked (LINE cannot tell them apart). */
export type DashboardUserStatus = "following" | "blocked";
/** `Member` = a Member with no tier yet. */
export type DashboardUserTier = "Platinum" | "Gold" | "Silver" | "Member";

export interface DashboardUserFilters {
  userType?: DashboardUserType;
  status?: DashboardUserStatus;
  tier?: DashboardUserTier;
  tag?: CustomerTag;
}

export interface FollowerMovementPoint {
  label: string;
  start: string;
  gained: number;
  lost: number;
  net: number;
}

export interface HourlyActivityPoint {
  hour: number;
  /** Average active users; null when the range has no such day. */
  weekday: number | null;
  weekend: number | null;
}

export interface DashboardUsers {
  period: DashboardPeriod;
  granularity: "hour" | "day" | "week";
  range: DashboardRange;
  filters: DashboardUserFilters;
  /** Unfollows are recorded from this date; earlier "lost" counts are 0. */
  trackingSince: string | null;
  kpis: {
    totalFollowers: Comparison;
    newFollowers: Comparison;
    unfollowed: Comparison;
    netGrowth: Comparison;
    activeRate: {
      windowDays: number;
      current: number | null;
      previous: number | null;
      activeUsers: number;
    };
  };
  movement: FollowerMovementPoint[];
  breakdown: {
    tiers: Array<{ tier: DashboardUserTier; count: number }>;
    members: number;
    userType: Array<{ userType: DashboardUserType; count: number }>;
    status: Array<{ status: DashboardUserStatus; count: number }>;
  };
  activity: {
    hours: HourlyActivityPoint[];
    weekdayDays: number;
    weekendDays: number;
    peak: { hour: number; kind: "weekday" | "weekend"; users: number } | null;
  };
  tags: Array<{ tag: CustomerTag; count: number }>;
}

// ── Sales tab ────────────────────────────────────────────────────────────

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

/** `revenue` (default) = Paid, Shipped & Completed. */
export type DashboardSalesStatus = "revenue" | "all" | OrderStatus;
export type DashboardBuyerType = "new" | "returning";

export interface DashboardSalesFilters {
  status?: DashboardSalesStatus;
  productId?: string;
  tier?: DashboardUserTier;
  buyerType?: DashboardBuyerType;
}

export interface SalesSeriesPoint {
  label: string;
  start: string;
  revenue: number;
  orders: number;
}

export interface SalesTopProduct {
  productId: string;
  name: string;
  units: number;
  revenue: number;
  /** % of item revenue in the period. */
  share: number;
  /** % change vs previous period; null when it had no sales. */
  change: number | null;
  /** Revenue per bucket, for the sparkline. */
  series: number[];
}

export interface DashboardSales {
  period: DashboardPeriod;
  granularity: "hour" | "day" | "week";
  range: DashboardRange;
  products: Array<{ id: string; name: string }>;
  kpis: {
    revenue: Comparison;
    orders: Comparison;
    avgOrderValue: Comparison;
    repeatRate: { current: number | null; previous: number | null };
    pendingPayment: { amount: Comparison; count: Comparison };
  };
  series: SalesSeriesPoint[];
  pipeline: Array<{ status: OrderStatus; count: number; amount: number }>;
  topProducts: SalesTopProduct[];
  revenueByTier: Array<{ tier: DashboardUserTier; revenue: number }>;
  buyers: { new: number; returning: number };
}
