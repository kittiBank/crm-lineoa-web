import { UserTier } from "@/constants/user-tier";

export type CardTier = UserTier | "NONE";

export interface TierTheme {
  label: string;
  /** Card background (credit-card style gradient). */
  card: string;
  /** Main text color on the card. */
  text: string;
  /** Secondary text on the card. */
  mutedText: string;
  /** Tier pill on the card. */
  pill: string;
  /** Progress bar fill and ladder dot. */
  accent: string;
}

// Same hues as the admin tier badges: Silver = slate, Gold = amber,
// Platinum = indigo.
export const TIER_THEMES: Record<CardTier, TierTheme> = {
  NONE: {
    label: "MEMBER",
    card: "bg-gradient-to-br from-gray-100 via-gray-300 to-gray-500",
    text: "text-gray-900",
    mutedText: "text-gray-700",
    pill: "bg-white/60 text-gray-800",
    accent: "bg-gray-500",
  },
  Silver: {
    label: "SILVER",
    card: "bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500",
    text: "text-slate-900",
    mutedText: "text-slate-700",
    pill: "bg-white/60 text-slate-800",
    accent: "bg-slate-500",
  },
  Gold: {
    label: "GOLD",
    card: "bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700",
    text: "text-amber-950",
    mutedText: "text-amber-900",
    pill: "bg-white/50 text-amber-900",
    accent: "bg-amber-500",
  },
  Platinum: {
    label: "PLATINUM",
    card: "bg-gradient-to-br from-indigo-400 via-indigo-800 to-slate-950",
    text: "text-white",
    mutedText: "text-indigo-100",
    pill: "bg-white/15 text-white",
    accent: "bg-indigo-600",
  },
};

export function themeFor(tier: UserTier | null): TierTheme {
  return TIER_THEMES[tier ?? "NONE"];
}
