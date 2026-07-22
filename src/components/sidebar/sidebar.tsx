"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU_ITEMS } from "@/constants/navigation";
import { useIsMounted } from "@/lib/hooks/useIsMounted";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Send,
  MessageSquare,
  Users,
  Menu,
  Settings,
  User,
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
}

/**
 * Sidebar component with navigation menu
 * Displays all main navigation items with active state highlighting
 */
export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const mounted = useIsMounted();

  const iconMap: Record<string, React.ReactNode> = {
    LayoutDashboard: <LayoutDashboard className="h-[18px] w-[18px]" />,
    Send: <Send className="h-[18px] w-[18px]" />,
    MessageSquare: <MessageSquare className="h-[18px] w-[18px]" />,
    Users: <Users className="h-[18px] w-[18px]" />,
    Menu: <Menu className="h-[18px] w-[18px]" />,
    Settings: <Settings className="h-[18px] w-[18px]" />,
    User: <User className="h-[18px] w-[18px]" />,
  };

  const isActive = (href: string) => {
    if (!mounted) return false;
    return pathname.startsWith(href);
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
        <ul className="space-y-1.5">
          {MENU_ITEMS.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                title={collapsed ? item.label : undefined}
                suppressHydrationWarning
                className={cn(
                  "flex items-center rounded-lg transition-colors",
                  collapsed
                    ? "justify-center px-2 py-2.5"
                    : "gap-3 px-3.5 py-2 text-[15px]",
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                )}
              >
                {iconMap[item.icon]}
                {!collapsed && (
                  <span className="truncate font-medium">{item.label}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
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
