/**
 * Broadcast types and interfaces
 */

export type BroadcastStatus =
  | "Draft"
  | "Scheduled"
  | "Sent"
  | "Failed"
  | "Processing";

export type BroadcastAudienceType = "all" | "active" | "new";

export type BroadcastSendMode = "now" | "schedule" | "draft";

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

export interface BroadcastRecord {
  id: string;
  name: string;
  description: string | null;
  audienceType: BroadcastAudienceType;
  status: string;
  messageCount: number;
  successCount: number;
  failureCount: number;
  scheduledFor: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
  templateId: string | null;
  template: {
    id: string;
    name: string;
    type: string;
  } | null;
}

export interface BroadcastAudienceOption {
  value: BroadcastAudienceType;
  label: string;
  description: string;
  count: number;
}

export interface CreateBroadcastPayload {
  name: string;
  description?: string;
  templateId: string;
  audienceType: BroadcastAudienceType;
  status: "draft" | "scheduled" | "processing";
  scheduledFor?: string;
}

export interface UpdateBroadcastPayload {
  name?: string;
  description?: string;
  templateId?: string;
  audienceType?: BroadcastAudienceType;
  status?: "draft" | "scheduled" | "processing";
  scheduledFor?: string | null;
}

export interface MetricsData {
  totalSent: number;
  percentageChange: number;
  averageReadRate: number;
  readRatePercentageChange: number;
  activeScheduled: number;
  nextBroadcastTime: string;
}

export interface BroadcastStats {
  totalSentThisMonth: number;
  percentageChange: number;
  averageReadRate: number;
  readRatePercentageChange: number;
  activeScheduled: number;
  nextBroadcastAt: string | null;
}

export interface FilterOptions {
  searchQuery: string;
  status: BroadcastStatus | "All Status";
  dateRange: string;
}

export const SEND_MODE_OPTIONS: {
  value: BroadcastSendMode;
  label: string;
  description: string;
}[] = [
  {
    value: "now",
    label: "Send Now",
    description: "Send this broadcast to the selected audience immediately",
  },
  {
    value: "schedule",
    label: "Schedule",
    description: "Choose a date and time to send later",
  },
  {
    value: "draft",
    label: "Save as Draft",
    description: "Save without sending so you can review later",
  },
];
