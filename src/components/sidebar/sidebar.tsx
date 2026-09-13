"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MENU_ITEMS,
  MenuItem,
  isMenuChildActive,
  isMenuPathActive,
} from "@/constants/navigation";
import { useIsMounted } from "@/lib/hooks/useIsMounted";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  LayoutDashboard,
  Send,
  MessageSquare,
  Bot,
  Users,
  UsersRound,
  Menu,
  Settings,
  User,
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-[18px] w-[18px]" />,
  Send: <Send className="h-[18px] w-[18px]" />,
  MessageSquare: <MessageSquare className="h-[18px] w-[18px]" />,
  Bot: <Bot className="h-[18px] w-[18px]" />,
  Users: <Users className="h-[18px] w-[18px]" />,
  UsersRound: <UsersRound className="h-[18px] w-[18px]" />,
  Menu: <Menu className="h-[18px] w-[18px]" />,
  Settings: <Settings className="h-[18px] w-[18px]" />,
  User: <User className="h-[18px] w-[18px]" />,
};

function itemClassName(active: boolean, collapsed: boolean) {
  return cn(
    "flex w-full items-center rounded-lg transition-colors",
    collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3.5 py-2 text-[15px]",
    active
      ? "bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
  );
}

/**
 * Sidebar component with navigation menu
 * Displays all main navigation items with active state highlighting
 */
export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const mounted = useIsMounted();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!mounted) {
      return;
    }

    setOpenMenus((current) => {
      const next = { ...current };
      for (const item of MENU_ITEMS) {
        if (!item.children?.length) {
          continue;
        }

        const siblingHrefs = item.children.map((child) => child.href);
        const hasActiveChild = item.children.some((child) =>
          isMenuChildActive(pathname, child.href, siblingHrefs),
        );

        if (hasActiveChild) {
          next[item.id] = true;
        }
      }
      return next;
    });
  }, [mounted, pathname]);

  const isCurrentPage = (href: string) => {
    const current = pathname.replace(/\/$/, "") || "/";
    const target = href.replace(/\/$/, "") || "/";
    return current === target;
  };

  const renderLink = (
    href: string,
    label: string,
    options: {
      icon?: string;
      collapsed?: boolean;
      active: boolean;
      className?: string;
    },
  ) => (
    <Link
      href={href}
      prefetch={false}
      title={options.collapsed ? label : undefined}
      suppressHydrationWarning
      aria-current={isCurrentPage(href) ? "page" : undefined}
      onClick={(event) => {
        if (isCurrentPage(href)) {
          event.preventDefault();
        }
      }}
      className={options.className}
    >
      {options.icon ? iconMap[options.icon] : null}
      {!options.collapsed && (
        <span className="truncate font-medium">{label}</span>
      )}
    </Link>
  );

  const renderItem = (item: MenuItem) => {
    const children = item.children ?? [];
    const siblingHrefs = children.map((child) => child.href);
    const hasActiveChild = children.some((child) =>
      mounted ? isMenuChildActive(pathname, child.href, siblingHrefs) : false,
    );
    const href = item.href ?? children[0]?.href;
    const isOpen = !collapsed && (openMenus[item.id] ?? hasActiveChild);

    if (children.length === 0 && href) {
      return (
        <li key={item.id}>
          {renderLink(href, item.label, {
            icon: item.icon,
            collapsed,
            active: mounted ? isMenuPathActive(pathname, href) : false,
            className: itemClassName(
              mounted ? isMenuPathActive(pathname, href) : false,
              collapsed,
            ),
          })}
        </li>
      );
    }

    return (
      <li key={item.id}>
        {collapsed && href ? (
          renderLink(href, item.label, {
            icon: item.icon,
            collapsed: true,
            active: hasActiveChild,
            className: itemClassName(hasActiveChild, true),
          })
        ) : (
          <button
            type="button"
            onClick={() =>
              setOpenMenus((current) => ({
                ...current,
                [item.id]: !(current[item.id] ?? hasActiveChild),
              }))
            }
            className={itemClassName(hasActiveChild, false)}
            aria-expanded={isOpen}
          >
            {iconMap[item.icon]}
            <span className="truncate font-medium">{item.label}</span>
            <ChevronDown
              className={cn(
                "ml-auto h-4 w-4 shrink-0 transition-transform",
                isOpen ? "rotate-180" : "",
              )}
            />
          </button>
        )}

        {isOpen ? (
          <ul className="mt-1 space-y-1 border-l border-gray-200 py-1 pl-3 ml-5 dark:border-gray-700">
            {children.map((child) => {
              const active = mounted
                ? isMenuChildActive(pathname, child.href, siblingHrefs)
                : false;

              return (
                <li key={child.id}>
                  {renderLink(child.href, child.label, {
                    active,
                    className: cn(
                      "flex items-center rounded-lg px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-blue-50 font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
                    ),
                  })}
                </li>
              );
            })}
          </ul>
        ) : null}
      </li>
    );
  };

  return (
    <aside
      className={cn(
        "hidden h-full w-full flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:flex",
        collapsed ? "items-center" : "",
      )}
    >
      <nav
        className={cn(
          "flex-1 overflow-y-auto py-3.5",
          collapsed ? "w-full px-2" : "px-3",
        )}
      >
        <ul className="space-y-1.5">{MENU_ITEMS.map(renderItem)}</ul>
      </nav>

      {!collapsed && (
        <div className="mt-auto border-t border-gray-200 p-3.5 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            v1.0.0 • CRM Dashboard
          </p>
        </div>
      )}
    </aside>
  );
}
