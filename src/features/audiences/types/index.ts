import {
  USER_TIER_DESCRIPTIONS,
  USER_TIER_LABELS,
  USER_TIERS,
  UserTier,
  isUserTier,
} from "@/constants/user-tier";

/**
 * Audience segment types for targeting LINE users
 */
export type AudienceSegmentType =
  | "all"
  | "user_type"
  | "active"
  | "new"
  | "segment";

/**
 * LINE user type filters
 */
export type AudienceUserTypeFilter = "Member" | "Guest";
export type AudienceUserTierFilter = UserTier;
export { UserTier, isUserTier };

export interface AudienceCriteria {
  /** Selected user types when type = user_type */
  userTypes?: AudienceUserTypeFilter[];
  /** Selected user tiers when type = user_type */
  userTiers?: AudienceUserTierFilter[];
  /** Days of recent activity when type = active */
  activityDays?: number;
  /** Days since follow when type = new */
  newFollowerDays?: number;
}

export interface Audience {
  id: string;
  name: string;
  description: string | null;
  type: AudienceSegmentType;
  criteria: AudienceCriteria;
  memberCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AudienceEstimate {
  type: AudienceSegmentType;
  criteria: AudienceCriteria;
  memberCount: number;
}

export interface CreateAudiencePayload {
  name: string;
  description?: string;
  type: AudienceSegmentType;
  criteria: AudienceCriteria;
  isActive?: boolean;
}

export interface UpdateAudiencePayload {
  name?: string;
  description?: string | null;
  type?: AudienceSegmentType;
  criteria?: AudienceCriteria;
  isActive?: boolean;
}

export interface AudienceSegmentOption {
  value: AudienceSegmentType;
  label: string;
  description: string;
}

export const AUDIENCE_SEGMENT_OPTIONS: AudienceSegmentOption[] = [
  {
    value: "all",
    label: "All LINE Users",
    description: "Target every user who follows this LINE OA",
  },
  {
    value: "user_type",
    label: "By User Type",
    description: "Filter by Member, Guest, and user tier",
  },
  {
    value: "active",
    label: "Active Users",
    description: "Users who interacted with the OA recently",
  },
  {
    value: "new",
    label: "New Followers",
    description: "Users who recently started following the OA",
  },
];

export const USER_TYPE_FILTER_OPTIONS: {
  value: AudienceUserTypeFilter;
  label: string;
  description: string;
}[] = [
  {
    value: "Member",
    label: "Member",
    description: "Registered members linked to this OA",
  },
  {
    value: "Guest",
    label: "Guest",
    description: "Followers who have not registered as members",
  },
];

export const USER_TIER_FILTER_OPTIONS: {
  value: AudienceUserTierFilter;
  label: string;
  description: string;
}[] = USER_TIERS.map((value) => ({
  value,
  label: USER_TIER_LABELS[value],
  description: USER_TIER_DESCRIPTIONS[value],
}));

export const ACTIVITY_DAY_OPTIONS = [7, 14, 30, 90] as const;
export const NEW_FOLLOWER_DAY_OPTIONS = [7, 14, 30] as const;

export const AUDIENCE_TYPE_LABELS: Record<AudienceSegmentType, string> = {
  all: "All Users",
  user_type: "User Type",
  active: "Active",
  new: "New",
  segment: "Segment",
};
