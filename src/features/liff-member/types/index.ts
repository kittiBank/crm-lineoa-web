import { UserTier } from "@/constants/user-tier";

export interface TierThreshold {
  tier: UserTier;
  /** Minimum spend (THB) in the spend window. */
  minSpend: number;
}

interface MemberCardBase {
  displayName: string | null;
  pictureUrl: string | null;
  tiers: TierThreshold[];
  spendWindowMonths: number;
}

export interface GuestMemberCard extends MemberCardBase {
  isMember: false;
}

export interface MemberCardData extends MemberCardBase {
  isMember: true;
  memberSince: string;
  /** Effective tier: the higher of assignedTier and earnedTier. */
  tier: UserTier | null;
  assignedTier: UserTier | null;
  earnedTier: UserTier | null;
  /** Spend (THB) in the last `spendWindowMonths` months. */
  spend: number;
  spendSince: string;
  nextTier: (TierThreshold & { remaining: number }) | null;
}

export type MemberCardResponse = GuestMemberCard | MemberCardData;
