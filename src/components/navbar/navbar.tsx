"use client";

import { LogOut, Settings, User } from "lucide-react";
import { useState } from "react";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { clearAuth, redirectToLogin } from "@/lib/auth";
import { useProfile } from "@/lib/hooks/useProfile";
import { Profile, ProfileLineAccount } from "@/lib/profile";

function initialsOf(profile: Profile | null): string {
  const source = profile?.name?.trim() || profile?.email || "";
  const words = source.split(/[\s@._-]+/).filter(Boolean);
  return (
    words
      .slice(0, 2)
      .map((word) => word[0]!.toUpperCase())
      .join("") || "?"
  );
}

/** LINE OA the signed-in user works on, shown after the user menu. */
function LineOaBadge({ account }: { account: ProfileLineAccount | null }) {
  if (!account) {
    return (
      <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs text-blue-100">
        ยังไม่ได้ผูก LINE OA
      </span>
    );
  }

  const name = account.displayName?.trim() || account.name;

  return (
    <div className="flex min-w-0 items-center gap-2" title={name}>
      {account.pictureUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={account.pictureUrl}
          alt=""
          className="h-8 w-8 shrink-0 rounded-full border border-white/30 object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/20 text-sm font-bold text-white">
          {name[0]?.toUpperCase() ?? "?"}
        </div>
      )}
      <div className="flex min-w-0 flex-col">
        <p className="max-w-[8rem] truncate text-sm font-medium text-white sm:max-w-[14rem]">
          {name}
        </p>
        {account.basicId && (
          <p className="hidden text-xs text-blue-100 sm:block">
            {account.basicId}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Top navigation bar component
 * Displays header with the user's LINE OA and user menu
 */
export function Navbar() {
  // State for mobile menu dropdown
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  // Falls back to the placeholder initials until the profile loads.
  const { profile, isSuperAdmin } = useProfile();

  // JWT is stateless: drop the stored token and cached data, then hard-redirect
  // so the realtime connection and in-memory state are torn down too.
  const handleLogout = () => {
    setIsUserMenuOpen(false);
    clearAuth();
    redirectToLogin();
  };

  return (
    <nav className="w-full bg-gradient-to-r from-blue-400 to-blue-600 border-b border-blue-700 shadow-lg h-16 flex items-center">
      {/* Left section - Logo/Brand */}
      <div className="px-4 md:px-6">
        <h1 className="text-white text-lg font-bold">CRM LINE OA</h1>
      </div>

      {/* Center spacer */}
      <div className="flex-1"></div>

      {/* Right section - notifications, user menu + LINE OA */}
      <div className="flex min-w-0 items-center gap-1 px-4 md:px-6">
        <NotificationBell />

        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-300/30 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold border border-white/30">
              {initialsOf(profile)}
            </div>
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-sm font-medium text-white">
                {profile?.name?.trim() || profile?.email || "\u00a0"}
              </p>
              {profile?.name?.trim() && (
                <p className="text-xs text-blue-100">{profile.email}</p>
              )}
              {isSuperAdmin && (
                <p className="text-[10px] font-semibold uppercase tracking-wide text-yellow-200">
                  Super admin
                </p>
              )}
            </div>
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <User className="w-4 h-4" />
                Profile
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>

        {profile && (
          <>
            <div className="mx-2 h-8 w-px shrink-0 bg-white/30" />
            <LineOaBadge account={profile.lineAccount} />
          </>
        )}
      </div>
    </nav>
  );
}
