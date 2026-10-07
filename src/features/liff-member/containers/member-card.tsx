"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { initLiffSession } from "@/features/liff-login/lib/liff";
import { setPendingCheckoutRedirect } from "@/features/liff-shop/lib/checkout-redirect";
import { TierCard } from "../components/tier-card";
import { TierLadder, TierProgress } from "../components/tier-progress";
import { themeFor } from "../components/tier-theme";
import { fetchMemberCard } from "../lib/api";
import { MemberCardResponse } from "../types";

export function MemberCardContainer() {
  const router = useRouter();
  const [card, setCard] = useState<MemberCardResponse | null>(null);
  const [mockQuery, setMockQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      try {
        const session = await initLiffSession();
        const data = await fetchMemberCard(session.lineUserId);
        if (isCancelled) return;
        // Keep the local-testing mock lineUserId across the login redirect.
        setMockQuery(
          session.usingMock
            ? `?lineUserId=${encodeURIComponent(session.lineUserId)}`
            : "",
        );
        setCard(data);
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load member card",
          );
        }
      }
    };

    load();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleBecomeMember = () => {
    setPendingCheckoutRedirect(`/liff/member${mockQuery}`);
    router.push(`/liff/login${mockQuery}`);
  };

  if (error) {
    return (
      <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
        {error}
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Loading your member card...</p>
      </div>
    );
  }

  const name = card.displayName || "LINE Member";

  if (!card.isMember) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <TierCard tier={null} name={name} locked />
        <section className="rounded-2xl border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Become a member to unlock tiers
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Verify your phone number once. Every paid order then counts toward
            Silver, Gold and Platinum.
          </p>
          <button
            type="button"
            onClick={handleBecomeMember}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#06C755] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#05b14c] active:scale-[0.98]"
          >
            <UserPlus className="h-4 w-4" />
            Become a member
          </button>
        </section>
        <TierLadder
          tiers={card.tiers}
          currentTier={null}
          spendWindowMonths={card.spendWindowMonths}
        />
      </div>
    );
  }

  // The shop granted a higher tier than spend alone would give.
  const isGranted =
    card.tier !== null &&
    card.tier === card.assignedTier &&
    card.tier !== card.earnedTier;

  return (
    <div className="flex flex-col gap-4 p-4">
      <TierCard
        tier={card.tier}
        name={name}
        memberSince={card.memberSince}
        spend={card.spend}
      />
      {isGranted && card.tier ? (
        <p className="-mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
          Your {themeFor(card.tier).label} tier was granted by the shop.
        </p>
      ) : null}
      <TierProgress card={card} />
      <TierLadder
        tiers={card.tiers}
        currentTier={card.tier}
        spendWindowMonths={card.spendWindowMonths}
      />
    </div>
  );
}
