import { faker } from "@faker-js/faker";
import { CUSTOMER_TAGS } from "@/constants/customer-tag";
import { LineUser, UserType, UserStatus, UserTier, USER_TIERS, FilterOptions } from "../types";

/**
 * Generate mock LINE user data
 * Used for development and testing
 */
export function generateMockLineUsers(count: number = 50): LineUser[] {
  const userTypes: UserType[] = ["Member", "Guest"];
  const userTiers: Array<UserTier | null> = [null, ...USER_TIERS];
  const statuses: UserStatus[] = ["Active", "Blocked", "Unfollowed"];

  return Array.from({ length: count }, () => {
    const tagsCount = faker.number.int({ min: 0, max: 3 });
    const selectedTags = Array.from(
      { length: tagsCount },
      () => CUSTOMER_TAGS[Math.floor(Math.random() * CUSTOMER_TAGS.length)]
    );

    return {
      id: faker.string.uuid(),
      lineUserId: `U${faker.string.alphanumeric(31).toUpperCase()}`,
      displayName: faker.person.fullName(),
      avatar: faker.image.avatar(),
      userType: userTypes[Math.floor(Math.random() * userTypes.length)],
      userTier: userTiers[Math.floor(Math.random() * userTiers.length)],
      assignedTier: null,
      points: faker.number.int({ min: 0, max: 2000 }),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      tags: [...new Set(selectedTags)].map((key) => ({ // Remove duplicates
        key,
        value: null,
        expiresAt: null,
        since: faker.date.recent({ days: 30 }).toISOString(),
      })),
      lastActive: faker.date.recent({ days: 30 }),
      dateAdded: faker.date.past({ years: 2 }),
      followedDate: faker.date.past({ years: 2 }),
    };
  });
}

/**
 * Filter LINE users based on search and filters
 */
export function filterLineUsers(
  users: LineUser[],
  searchQuery: string,
  searchType: string,
  userType: string,
  status: string
): LineUser[] {
  return users.filter((user) => {
    const queryLower = searchQuery.toLowerCase();

    // Search filter
    let matchesSearch = true;
    if (searchQuery) {
      if (searchType === "displayName") {
        matchesSearch = user.displayName.toLowerCase().includes(queryLower);
      } else if (searchType === "userId") {
        matchesSearch = user.lineUserId.toLowerCase().includes(queryLower);
      } else {
        // "all" - search both fields
        matchesSearch =
          user.displayName.toLowerCase().includes(queryLower) ||
          user.lineUserId.toLowerCase().includes(queryLower);
      }
    }

    // User type filter
    const matchesUserType = userType === "All" || user.userType === userType;

    // Status filter
    const matchesStatus = status === "All" || user.status === status;

    return matchesSearch && matchesUserType && matchesStatus;
  });
}
