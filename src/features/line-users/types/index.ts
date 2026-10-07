/**
 * LINE Users types and interfaces
 */

import {
  USER_TIERS,
  UserTier,
  isUserTier,
} from "@/constants/user-tier";

export type UserType = "Member" | "Guest";
export type UserStatus = "Active" | "Blocked" | "Unfollowed";
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
  status: UserStatus;
  tags: string[];
  lastActive: Date;
  dateAdded: Date;
  followedDate?: Date;
}

export interface FilterOptions {
  searchQuery: string;
  userType: UserType | "All";
  status: UserStatus | "All";
  dateRange: string;
}

export const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  searchQuery: "",
  userType: "All",
  status: "All",
  dateRange: "",
};
