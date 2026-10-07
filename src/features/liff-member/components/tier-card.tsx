"use client";

import { useState } from "react";
import { Crown, Lock } from "lucide-react";
import { UserTier } from "@/constants/user-tier";
import { formatBaht } from "../lib/api";
import { themeFor } from "./tier-theme";

interface TierCardProps {
  tier: UserTier | null;
  name: string;
  /** ISO date; omitted on the locked (guest) card. */
  memberSince?: string;
  spend?: number;
  locked?: boolean;
}

const MAX_TILT_DEG = 8;

function formatMemberSince(value: string) {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${month}/${String(date.getFullYear()).slice(-2)}`;
}

/** EMV-style chip drawn with CSS. */
function CardChip() {
  return (
    <div className="relative h-8 w-11 overflow-hidden rounded-md bg-gradient-to-br from-yellow-100 via-yellow-300 to-yellow-600 shadow-inner">
      <div className="absolute inset-x-0 top-1/2 h-px bg-yellow-700/40" />
      <div className="absolute inset-y-0 left-1/3 w-px bg-yellow-700/40" />
      <div className="absolute inset-y-0 right-1/3 w-px bg-yellow-700/40" />
      <div className="absolute inset-y-2 left-1/3 right-1/3 rounded-sm border border-yellow-700/40" />
    </div>
  );
}

/** Credit-card style member card; tilts toward the pointer or finger. */
export function TierCard({
  tier,
  name,
  memberSince,
  spend,
  locked = false,
}: TierCardProps) {
  const theme = themeFor(tier);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -py * MAX_TILT_DEG * 2, y: px * MAX_TILT_DEG * 2 });
  };

  return (
    <div className="[perspective:1000px]">
      <div
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
        onPointerUp={() => setTilt({ x: 0, y: 0 })}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
        className={`relative aspect-[1.586/1] w-full touch-pan-y overflow-hidden rounded-2xl p-5 shadow-xl shadow-black/20 transition-transform duration-200 ease-out select-none ${theme.card} ${theme.text}`}
        role="img"
        aria-label={`${theme.label} member card for ${name}`}
      >
        {/* Shine */}
        <div className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-white/25 blur-2xl" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.18)_45%,transparent_55%)]" />

        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#06C755] text-[10px] font-bold text-white">
                OA
              </div>
              <span className="text-sm font-semibold tracking-wide">
                Member Card
              </span>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tracking-widest backdrop-blur-sm ${theme.pill}`}
            >
              {tier ? <Crown className="h-3.5 w-3.5" /> : null}
              {theme.label}
            </span>
          </div>

          {locked ? (
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lock className="h-4 w-4" />
              Members only
            </div>
          ) : (
            <CardChip />
          )}

          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold tracking-[0.15em] uppercase">
                {name}
              </p>
              {memberSince ? (
                <p
                  className={`mt-0.5 text-[10px] tracking-[0.2em] uppercase ${theme.mutedText}`}
                >
                  Member since {formatMemberSince(memberSince)}
                </p>
              ) : null}
            </div>
            {spend !== undefined ? (
              <div className="shrink-0 text-right">
                <p
                  className={`text-[10px] tracking-[0.2em] uppercase ${theme.mutedText}`}
                >
                  Spend
                </p>
                <p className="text-base font-bold tabular-nums">
                  {formatBaht(spend)}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
