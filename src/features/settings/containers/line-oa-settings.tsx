"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { LineAccountForm } from "@/components/line-account-form";
import { LineOaProfileCard } from "@/features/settings/components/line-oa-profile-card";
import {
  fetchAdminLineAccount,
  fetchAdminLineAccounts,
  fetchLineAccount,
  peekLineAccountCache,
} from "@/features/settings/lib/api";
import {
  AdminLineAccount,
  LineAccountResponse,
  LineOaInfo,
} from "@/features/settings/types";
import { useProfile } from "@/lib/hooks/useProfile";
import { useToast } from "@/lib/hooks/useToast";

/** Picker value for the empty "connect a new OA" form. */
const NEW_ACCOUNT = "new";

export function LineOaSettings() {
  const toast = useToast();
  const { profile, loading: profileLoading, isSuperAdmin } = useProfile();
  const [account, setAccount] = useState<LineAccountResponse | null>(null);
  const [oaInfo, setOaInfo] = useState<LineOaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({
    existing: false,
    verified: false,
    testing: false,
  });
  // Super admin only: every OA and the one being viewed.
  const [accounts, setAccounts] = useState<AdminLineAccount[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Latest pick, so a slow response for an earlier pick is ignored.
  const selectedRef = useRef<string | null>(null);

  const showAccount = useCallback((data: LineAccountResponse) => {
    setAccount(data);
    setOaInfo(data.oaInfo ?? null);
    setStatus((prev) => ({ ...prev, existing: Boolean(data.connected) }));
  }, []);

  /** Super admin: view an OA, or an empty form to connect a new one. */
  const selectAccount = useCallback(
    (id: string) => {
      selectedRef.current = id;
      setSelectedId(id);

      if (id === NEW_ACCOUNT) {
        showAccount({ connected: false });
        setLoading(false);
        return;
      }

      setLoading(true);
      fetchAdminLineAccount(id)
        .then((data) => selectedRef.current === id && showAccount(data))
        .catch((error: unknown) => {
          if (selectedRef.current === id) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to load LINE account",
            );
          }
        })
        .finally(() => selectedRef.current === id && setLoading(false));
    },
    [showAccount, toast],
  );

  // Admins: their own OA, served from cache first.
  useEffect(() => {
    if (profileLoading || isSuperAdmin) {
      return;
    }

    let cancelled = false;

    async function loadAccount() {
      const cached = peekLineAccountCache();
      if (cached?.connected) {
        showAccount(cached);
        setLoading(false);
      }

      try {
        const data = await fetchLineAccount({ force: true });
        if (!cancelled) {
          showAccount(data);
        }
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
  }, [profileLoading, isSuperAdmin]);

  // Super admin: load the OA list, starting on their own OA.
  useEffect(() => {
    if (!isSuperAdmin) {
      return;
    }

    let cancelled = false;
    fetchAdminLineAccounts()
      .then((list) => {
        if (cancelled) return;
        setAccounts(list);
        const ownId = profile?.lineAccount?.id;
        selectAccount(
          list.find((item) => item.id === ownId)?.id ??
            list[0]?.id ??
            NEW_ACCOUNT,
        );
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        toast.error(
          error instanceof Error ? error.message : "Failed to load LINE accounts",
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin]);

  const handleStatusChange = useCallback(
    (next: { existing: boolean; verified: boolean; testing: boolean }) => {
      setStatus(next);
    },
    [],
  );

  const handleSaved = useCallback(
    async (saved: LineAccountResponse) => {
      try {
        setAccounts(await fetchAdminLineAccounts());
      } catch {
        // The picker refreshes on the next visit; the save itself succeeded.
      }
      if (saved.id) {
        selectAccount(saved.id);
      }
    },
    [selectAccount],
  );

  const pageLoading = profileLoading || loading || !account;

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
          {isSuperAdmin
            ? "Connect LINE Official Accounts and review any OA's profile and follower stats."
            : "Your LINE Official Account profile and follower stats."}
        </p>
      </div>

      {/* Super admin toolbar: OA picker (left) + connect button (right) */}
      {isSuperAdmin && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <select
            aria-label="LINE OA"
            value={selectedId === NEW_ACCOUNT ? "" : (selectedId ?? "")}
            onChange={(e) => selectAccount(e.target.value)}
            disabled={accounts.length === 0}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto sm:min-w-[280px] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {selectedId === NEW_ACCOUNT && (
              <option value="" disabled>
                {accounts.length ? "Select LINE OA" : "No LINE OA yet"}
              </option>
            )}
            {accounts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.displayName || item.name}
                {item.basicId ? ` (${item.basicId})` : ""} ·{" "}
                {item.memberCount} user{item.memberCount === 1 ? "" : "s"}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => selectAccount(NEW_ACCOUNT)}
            disabled={selectedId === NEW_ACCOUNT}
            className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            <Plus className="h-4 w-4" />
            Connect New LINE OA
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-5">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 xl:col-span-3">
          <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
            {selectedId === NEW_ACCOUNT
              ? "Connect New LINE Official Account"
              : "LINE Official Account"}
          </h2>
          {pageLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading LINE account...
            </div>
          ) : !isSuperAdmin && !account.connected ? (
            <p className="py-8 text-sm text-gray-500 dark:text-gray-400">
              ยังไม่ได้ผูก LINE OA. Contact the super admin to assign your
              account to a LINE OA.
            </p>
          ) : (
            <LineAccountForm
              key={selectedId ?? account.id ?? NEW_ACCOUNT}
              initialAccount={account}
              readOnly={!isSuperAdmin}
              onStatusChange={handleStatusChange}
              onOaInfoChange={setOaInfo}
              onSaved={handleSaved}
            />
          )}
        </div>

        <div className="xl:col-span-2">
          <LineOaProfileCard
            info={oaInfo}
            loading={pageLoading}
            testing={status.testing}
            verified={status.verified}
          />
        </div>
      </div>
    </div>
  );
}
