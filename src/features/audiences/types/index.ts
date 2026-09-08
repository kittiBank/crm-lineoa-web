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
  | "combined"
  | "segment";

export const COMBINABLE_AUDIENCE_RULES = ["user_type", "active", "new"] as const;
export type CombinableAudienceRule = (typeof COMBINABLE_AUDIENCE_RULES)[number];
export type TargetingRule = CombinableAudienceRule;
export type AudienceMatchMode = "and" | "or";

/**
 * LINE user type filters
 */
export type AudienceUserTypeFilter = "Member" | "Guest";
export type AudienceUserTierFilter = UserTier;
export { UserTier, isUserTier };

export interface AudienceCriteria {
  /** How to combine rules when type = combined */
  match?: AudienceMatchMode;
  /** Selected user types when type = user_type or combined */
  userTypes?: AudienceUserTypeFilter[];
  /** Selected user tiers when user type is selected */
  userTiers?: AudienceUserTierFilter[];
  /** Days of recent activity when type = active or combined */
  activityDays?: number;
  /** Days since follow when type = new or combined */
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

export type AudienceWritableType = Exclude<
  AudienceSegmentType,
  "all" | "segment"
>;

export interface CreateAudiencePayload {
  name: string;
  description?: string;
  type: AudienceWritableType;
  criteria: AudienceCriteria;
  isActive?: boolean;
}

export interface UpdateAudiencePayload {
  name?: string;
  description?: string | null;
  type?: AudienceWritableType;
  criteria?: AudienceCriteria;
  isActive?: boolean;
}

export interface AudienceSegmentOption {
  value: TargetingRule;
  label: string;
  description: string;
}

export const AUDIENCE_SEGMENT_OPTIONS: AudienceSegmentOption[] = [
  {
    value: "user_type",
    label: "By User Type",
    description: "Filter by Member, Guest, and user tier. Can be combined with other rules.",
  },
  {
    value: "active",
    label: "Active Users",
    description: "Users who interacted with the OA recently. Can be combined with other rules.",
  },
  {
    value: "new",
    label: "New Followers",
    description: "Users who recently started following the OA. Can be combined with other rules.",
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
  combined: "Combined",
  segment: "Segment",
};

export const AUDIENCE_MATCH_MODE_LABELS: Record<AudienceMatchMode, string> = {
  and: "AND",
  or: "OR",
};
