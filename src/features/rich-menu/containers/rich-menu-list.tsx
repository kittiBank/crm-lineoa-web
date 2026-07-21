"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchRichMenus, applyMemberRichMenu } from "../lib/api";
import { RichMenuRecord } from "../types";
import { useToast } from "@/lib/hooks/useToast";

export function RichMenuListContainer() {
  const toast = useToast();
  const [menus, setMenus] = useState<RichMenuRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const loadMenus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchRichMenus();
      setMenus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rich menus");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const handleApplyMember = async (menuId: string) => {
    setApplyingId(menuId);
    try {
      const result = await applyMemberRichMenu(menuId);
      toast.success(`Linked member menu to ${result.linkedCount} users`);
      await loadMenus();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to apply member menu",
      );
    } finally {
      setApplyingId(null);
    }
  };

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Rich Menu", isActive: true },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Rich Menu
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create and manage LINE Rich Menu configurations
          </p>
        </div>
        <Link href="/rich-menu/create">
          <Button className="bg-blue-600 text-white hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Rich Menu
          </Button>
        </Link>
      </div>

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
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              Create Rich Menu
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {menus.map((menu) => (
            <article
              key={menu.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="aspect-[2500/1686] bg-gray-100 dark:bg-gray-900">
                {menu.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={menu.imageUrl}
                    alt={menu.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    No preview
                  </div>
                )}
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {menu.name}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {menu.chatBarText} · {menu.sizeWidth}×{menu.sizeHeight}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={menu.menuType === "default" ? "default" : "secondary"}>
                      {menu.menuType === "default" ? "Guest" : "Member"}
                    </Badge>
                    {menu.isActive && (
                      <Badge variant="outline">Active</Badge>
                    )}
                  </div>
                </div>

                {menu.menuType === "member" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={applyingId === menu.id}
                    onClick={() => handleApplyMember(menu.id)}
                    className="w-full"
                  >
                    {applyingId === menu.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Linking...
                      </>
                    ) : (
                      "Link to all members"
                    )}
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
