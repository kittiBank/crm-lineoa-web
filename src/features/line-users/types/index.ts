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
  userTier: UserTier | null;
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
