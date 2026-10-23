/**
 * LINE Users types and interfaces
 */

import {
  USER_TIERS,
  UserTier,
  isUserTier,
} from "@/constants/user-tier";
import { CustomerTag } from "@/constants/customer-tag";

export type UserType = "Member" | "Guest";
export type UserStatus = "Active" | "Blocked" | "Unfollowed";

/** Auto customer tag from shop orders (see constants/customer-tag). */
export interface CustomerTagItem {
  key: CustomerTag;
  /** Repeat count, gap days or month spend, depending on the tag. */
  value: number | null;
  /** When the tag ends; null = permanent. */
  expiresAt: string | null;
  since: string;
}
export { USER_TIERS, UserTier, isUserTier };

export interface LineUser {
  id: string;
  lineUserId: string;
  displayName: string;
  avatar?: string;
  userType: UserType;
  /** Effective tier: the higher of assignedTier and the 12-month spend tier. */
  userTier: UserTier | null;
  /** Tier set by an admin (import or edit); a minimum. */
  assignedTier: UserTier | null;
  /** Verified tel no (Members only). */
  phone?: string;
  /** Loyalty point balance */
  points: number;
  status: UserStatus;
  tags: CustomerTagItem[];
  lastActive: Date;
  dateAdded: Date;
  followedDate?: Date;
}

export interface FilterOptions {
  searchQuery: string;
  userType: UserType | "All";
  status: UserStatus | "All";
  dateRange: string;
  tag: CustomerTag | "All";
}

export const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  searchQuery: "",
  userType: "All",
  status: "All",
  dateRange: "",
  tag: "All",
};
