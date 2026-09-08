export enum UserTier {
  Silver = "Silver",
  Gold = "Gold",
  Platinum = "Platinum",
}

export const USER_TIERS = Object.values(UserTier);

export function isUserTier(value: unknown): value is UserTier {
  return (USER_TIERS as string[]).includes(value as string);
}

export const USER_TIER_LABELS: Record<UserTier, string> = {
  [UserTier.Silver]: "Silver",
  [UserTier.Gold]: "Gold",
  [UserTier.Platinum]: "Platinum",
};

export const USER_TIER_DESCRIPTIONS: Record<UserTier, string> = {
  [UserTier.Silver]: "Silver-tier members",
  [UserTier.Gold]: "Gold-tier members",
  [UserTier.Platinum]: "Platinum-tier members",
};
