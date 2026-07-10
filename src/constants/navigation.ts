/**
 * Navigation menu items for the application
 * Used in sidebar and mobile menu components
 */
export const MENU_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    id: "broadcasts",
    label: "Broadcasts",
    href: "/broadcasts",
    icon: "Send",
  },
  {
    id: "templates",
    label: "Message Templates",
    href: "/templates",
    icon: "MessageSquare",
  },
  {
    id: "line-users",
    label: "LINE Users",
    href: "/line-users",
    icon: "Users",
  },
  {
    id: "rich-menu",
    label: "Rich Menu",
    href: "/rich-menu",
    icon: "Menu",
  },
  {
    id: "settings",
    label: "LINE OA Settings",
    href: "/settings",
    icon: "Settings",
  },
  {
    id: "user-settings",
    label: "User Settings",
    href: "/user-settings",
    icon: "User",
  },
];

/**
 * Breadcrumb configuration for routes
 * Maps route paths to breadcrumb labels
 */
export const BREADCRUMB_MAP: Record<string, string[]> = {
  "/dashboard": ["Dashboard"],
  "/broadcasts": ["Broadcasts"],
  "/broadcasts/create": ["Broadcasts", "Create"],
  "/broadcasts/[id]": ["Broadcasts", "Edit"],
  "/templates": ["Message Templates"],
  "/line-users": ["LINE Users"],
  "/rich-menu": ["Rich Menu"],
  "/settings": ["LINE OA Settings"],
  "/user-settings": ["User Settings"],
};
