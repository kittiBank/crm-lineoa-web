export type TrackingWindowState = "active" | "closed" | "unavailable";

/** Recipients are only LINE users the broadcast reached (delivery succeeded). */
export type TrackingRecipientFilter = "all" | "clicked" | "not_clicked";

export interface BroadcastTrackingLink {
  id: string;
  url: string;
  label: string | null;
  source: string;
  position: number;
  totalClicks: number;
  uniqueClicks: number;
  /** LINE Insight numbers — null until synced or when under 20 users. */
  lineClicks: number | null;
  lineUniqueClicks: number | null;
}

export interface BroadcastTrackingSummary {
  broadcastId: string;
  tracking: {
    state: TrackingWindowState;
    sendMode: "broadcast" | "multicast" | "push" | null;
    sentAt: string | null;
    expiresAt: string | null;
  };
  metrics: {
    reach: number;
    failed: number;
    /** Unique impressions from LINE Insight; null when hidden or not synced. */
    read: number | null;
    readRate: number | null;
    uniqueClicks: number;
    totalClicks: number;
    anonymousClicks: number;
    clickRate: number | null;
  };
  insight: {
    delivered: number | null;
    uniqueImpression: number | null;
    uniqueClick: number | null;
    uniqueMediaPlayed: number | null;
    isFinal: boolean;
    syncError: string | null;
    syncedAt: string;
  } | null;
  links: BroadcastTrackingLink[];
}

export interface BroadcastTrackingRecipient {
  /** LineUser record id */
  id: string;
  lineUserId: string | null;
  displayName: string | null;
  pictureUrl: string | null;
  userType: string | null;
  userTier: string | null;
  clickCount: number;
  firstClickedAt: string | null;
  lastClickedAt: string | null;
}

export interface BroadcastTrackingRecipientsResponse {
  data: BroadcastTrackingRecipient[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  counts: Record<TrackingRecipientFilter, number>;
}

export interface TrackingRecipientsQuery {
  page: number;
  limit: number;
  filter: TrackingRecipientFilter;
  search?: string;
}
