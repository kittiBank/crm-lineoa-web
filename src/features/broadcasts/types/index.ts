/**
 * Broadcast types and interfaces
 */

export type BroadcastStatus = "Sent" | "Scheduled" | "Draft" | "Failed";

export interface Broadcast {
  id: string;
  campaignName: string;
  targetAudience: string;
  audienceCount: number;
  template: {
    id: string;
    name: string;
  };
  status: BroadcastStatus;
  performance: {
    delivered: number;
    readRate: number;
  };
  createdAt: Date;
}

export interface MetricsData {
  totalSent: number;
  percentageChange: number;
  averageReadRate: number;
  activeScheduled: number;
  nextBroadcastTime: string;
}

export interface FilterOptions {
  searchQuery: string;
  status: BroadcastStatus | "All Status";
  dateRange: string;
}
