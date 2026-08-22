"use client";

import { useCallback, useState } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { LineAccountForm } from "@/components/line-account-form";
import { LineOaProfileCard } from "@/features/settings/components/line-oa-profile-card";
import { LineOaInfo } from "@/features/settings/types";

export function LineOaSettings() {
  const [oaInfo, setOaInfo] = useState<LineOaInfo | null>(null);
  const [status, setStatus] = useState({
    loading: true,
    existing: false,
    verified: false,
    testing: false,
  });

  const handleStatusChange = useCallback(
    (next: {
      loading: boolean;
      existing: boolean;
      verified: boolean;
      testing: boolean;
    }) => {
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
          <LineAccountForm
            onStatusChange={handleStatusChange}
            onOaInfoChange={setOaInfo}
          />
        </div>

        <div className="xl:col-span-2">
          <LineOaProfileCard
            info={oaInfo}
            loading={status.loading}
            testing={status.testing}
            verified={status.verified}
          />
        </div>
      </div>
    </div>
  );
}
