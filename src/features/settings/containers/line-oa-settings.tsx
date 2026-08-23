"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { LineAccountForm } from "@/components/line-account-form";
import { LineOaProfileCard } from "@/features/settings/components/line-oa-profile-card";
import { fetchLineAccount, peekLineAccountCache } from "@/features/settings/lib/api";
import { LineAccountResponse, LineOaInfo } from "@/features/settings/types";
import { useToast } from "@/lib/hooks/useToast";

export function LineOaSettings() {
  const toast = useToast();
  const [account, setAccount] = useState<LineAccountResponse | null>(null);
  const [oaInfo, setOaInfo] = useState<LineOaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({
    existing: false,
    verified: false,
    testing: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadAccount() {
      const cached = peekLineAccountCache();
      if (cached?.connected) {
        setAccount(cached);
        setOaInfo(cached.oaInfo ?? null);
        setStatus((prev) => ({
          ...prev,
          existing: true,
        }));
        setLoading(false);
      }

      try {
        const data = await fetchLineAccount({ force: true });
        if (cancelled) {
          return;
        }

        setAccount(data);
        setOaInfo(data.oaInfo ?? null);
        setStatus((prev) => ({
          ...prev,
          existing: Boolean(data.connected),
        }));
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to load LINE account",
          );
          if (!cached?.connected) {
            setAccount({ connected: false });
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAccount();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = useCallback(
    (next: { existing: boolean; verified: boolean; testing: boolean }) => {
      setStatus(next);
    },
    [],
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard" },
          { label: "LINE OA Settings", isActive: true },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          LINE OA Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Connect your LINE Official Account, then review live profile and
          follower stats.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-5">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 xl:col-span-3">
          <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
            Connect LINE Official Account
          </h2>
          {loading || !account ? (
            <div className="flex items-center gap-2 py-8 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading LINE account...
            </div>
          ) : (
            <LineAccountForm
              initialAccount={account}
              onStatusChange={handleStatusChange}
              onOaInfoChange={setOaInfo}
            />
          )}
        </div>

        <div className="xl:col-span-2">
          <LineOaProfileCard
            info={oaInfo}
            loading={loading}
            testing={status.testing}
            verified={status.verified}
          />
        </div>
      </div>
    </div>
  );
}
