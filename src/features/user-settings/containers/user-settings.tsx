"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { AudiencePagination } from "@/features/audiences/components/audience-pagination";
import { fetchAdminLineAccounts } from "@/features/settings/lib/api";
import { AdminLineAccount } from "@/features/settings/types";
import { useProfile } from "@/lib/hooks/useProfile";
import { useToast } from "@/lib/hooks/useToast";
import { CreateUserDialog } from "../components/create-user-dialog";
import { UserSettingsHeader } from "../components/user-settings-header";
import { UsersTable } from "../components/users-table";
import { fetchUsers } from "../lib/api";
import { AdminUser } from "../types";

/**
 * User Settings page
 * Super admins manage users and the LINE OA each user works on.
 */
export function UserSettings() {
  const toast = useToast();
  const { loading: profileLoading, isSuperAdmin } = useProfile();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [reloadKey, setReloadKey] = useState(0);
  const [lineAccounts, setLineAccounts] = useState<AdminLineAccount[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  // OA options for the create dialog.
  useEffect(() => {
    if (!isSuperAdmin) {
      return;
    }

    let cancelled = false;
    fetchAdminLineAccounts()
      .then((list) => !cancelled && setLineAccounts(list))
      .catch((error: unknown) => {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to load LINE accounts",
          );
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin]);

  useEffect(() => {
    if (!isSuperAdmin) {
      return;
    }

    let cancelled = false;

    const loadUsers = async () => {
      setUsersLoading(true);
      try {
        const result = await fetchUsers({
          page: currentPage,
          limit: itemsPerPage,
        });
        if (cancelled) return;

        setUsers(result.data);
        setTotalItems(result.meta.total);
        setTotalPages(Math.max(1, result.meta.totalPages));
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error ? error.message : "Failed to load users",
          );
        }
      } finally {
        if (!cancelled) {
          setUsersLoading(false);
        }
      }
    };

    void loadUsers();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin, currentPage, itemsPerPage, reloadKey]);

  // Users are listed oldest first, so a new user lands on the last page.
  const handleCreated = useCallback(() => {
    setCurrentPage(Math.max(1, Math.ceil((totalItems + 1) / itemsPerPage)));
    setReloadKey((key) => key + 1);
  }, [totalItems, itemsPerPage]);

  return (
    <div className="space-y-2">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard" },
          { label: "User Settings", isActive: true },
        ]}
      />

      <UserSettingsHeader
        onCreate={isSuperAdmin ? () => setCreateOpen(true) : undefined}
      />

      <div className="mt-6">
        {profileLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : isSuperAdmin ? (
          <>
            <UsersTable
              users={users}
              startIndex={(currentPage - 1) * itemsPerPage}
              isLoading={usersLoading}
            />
            <AudiencePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              itemLabel="users"
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(nextItemsPerPage) => {
                setItemsPerPage(nextItemsPerPage);
                setCurrentPage(1);
              }}
            />
          </>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            Only the super admin can manage users.
          </div>
        )}
      </div>

      {isSuperAdmin && (
        <CreateUserDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          lineAccounts={lineAccounts}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
