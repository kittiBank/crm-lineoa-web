"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { RichMenuCard, RichMenuHeader, SearchFilters, DeleteRichMenuDialog } from "@/features/rich-menu/components";
import {
  applyMemberRichMenu,
  deleteRichMenu,
  fetchRichMenus,
} from "@/features/rich-menu/lib/api";
import { filterRichMenus } from "@/features/rich-menu/lib/filterRichMenus";
import {
  DEFAULT_RICH_MENU_FILTERS,
  RichMenuFilterOptions,
  RichMenuRecord,
} from "@/features/rich-menu/types";
import { useToast } from "@/lib/hooks/useToast";

export function RichMenuListContainer() {
  const router = useRouter();
  const toast = useToast();
  const [menus, setMenus] = useState<RichMenuRecord[]>([]);
  const [filters, setFilters] = useState<RichMenuFilterOptions>(
    DEFAULT_RICH_MENU_FILTERS,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [menuToDelete, setMenuToDelete] = useState<RichMenuRecord | null>(null);
  const requestIdRef = useRef(0);

  const filteredMenus = useMemo(
    () => filterRichMenus(menus, filters),
    [menus, filters],
  );

  const loadMenus = async (force = false) => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchRichMenus({ force });
      if (requestId !== requestIdRef.current) {
        return;
      }
      setMenus(data);
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load rich menus");
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadMenus();
    return () => {
      requestIdRef.current += 1;
    };
    // Initial load only; apply-member refresh calls loadMenus(true) directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyMember = async (menuId: string) => {
    setApplyingId(menuId);
    try {
      const result = await applyMemberRichMenu(menuId);
      toast.success(`Linked member menu to ${result.linkedCount} users`);
      await loadMenus(true);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to apply member menu",
      );
    } finally {
      setApplyingId(null);
    }
  };

  const handleView = (menuId: string) => {
    router.push(`/rich-menu/${menuId}/view`);
  };

  const handleEdit = (menuId: string) => {
    router.push(`/rich-menu/${menuId}/edit`);
  };

  const handleDeleteClick = (menuId: string) => {
    const menu = menus.find((item) => item.id === menuId);
    if (menu) {
      setMenuToDelete(menu);
    }
  };

  const handleConfirmDelete = async () => {
    if (!menuToDelete) {
      return;
    }

    setDeletingId(menuToDelete.id);
    try {
      await deleteRichMenu(menuToDelete.id);
      setMenus((current) =>
        current.filter((item) => item.id !== menuToDelete.id),
      );
      setMenuToDelete(null);
      toast.success(`"${menuToDelete.name}" deleted successfully`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete rich menu",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    if (!open && !deletingId) {
      setMenuToDelete(null);
    }
  };

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Rich Menu", isActive: true },
  ];

  return (
    <div className="space-y-2">
      <Breadcrumbs items={breadcrumbItems} />

      <RichMenuHeader />

      <SearchFilters filters={filters} onFilterChange={setFilters} />

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading rich menus...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : menus.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            No rich menus yet. Create your first menu to show on LINE OA.
          </p>
          <Link href="/rich-menu/create" className="mt-4 inline-block">
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 active:scale-95"
            >
              New Rich Menu
            </button>
          </Link>
        </div>
      ) : filteredMenus.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            No rich menus match your search filters.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredMenus.map((menu) => (
            <RichMenuCard
              key={menu.id}
              menu={menu}
              isApplying={applyingId === menu.id}
              isDeleting={deletingId === menu.id}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onApplyMember={
                menu.menuType === "member" ? handleApplyMember : undefined
              }
            />
          ))}
        </div>
      )}

      <DeleteRichMenuDialog
        menu={menuToDelete}
        isDeleting={Boolean(deletingId)}
        onOpenChange={handleDeleteDialogOpenChange}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
