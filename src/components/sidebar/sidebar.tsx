"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU_ITEMS } from "@/constants/navigation";
import { useIsMounted } from "@/lib/hooks/useIsMounted";
import {
  LayoutDashboard,
  Send,
  MessageSquare,
  Users,
  Menu,
  Settings,
  User,
} from "lucide-react";

/**
 * Sidebar component with navigation menu
 * Displays all main navigation items with active state highlighting
 */
export function Sidebar() {
  const pathname = usePathname();
  const mounted = useIsMounted();

  // Map icon names to lucide-react icon components
  const iconMap: Record<string, React.ReactNode> = {
    LayoutDashboard: <LayoutDashboard className="w-5 h-5" />,
    Send: <Send className="w-5 h-5" />,
    MessageSquare: <MessageSquare className="w-5 h-5" />,
    Users: <Users className="w-5 h-5" />,
    Menu: <Menu className="w-5 h-5" />,
    Settings: <Settings className="w-5 h-5" />,
    User: <User className="w-5 h-5" />,
  };

  /**
   * Check if a menu item is currently active
   */
  const isActive = (href: string) => {
    if (!mounted) return false;
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-full bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-2">
          {MENU_ITEMS.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                suppressHydrationWarning
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                {iconMap[item.icon]}
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          v1.0.0 • CRM Dashboard
        </p>
      </div>
    </aside>
  );
}
