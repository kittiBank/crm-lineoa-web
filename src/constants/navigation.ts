/**
 * Navigation menu items for the application
 * Used in sidebar and mobile menu components
 */

export interface MenuChild {
  id: string;
  label: string;
  href: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  children?: MenuChild[];
}

export const MENU_ITEMS: MenuItem[] = [
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
    id: "auto-message",
    label: "Auto Message",
    href: "/auto-message",
    icon: "Bot",
  },
  {
    id: "line-users",
    label: "LINE Users",
    href: "/line-users",
    icon: "Users",
  },
  {
    id: "audiences",
    label: "Audience Management",
    icon: "UsersRound",
    children: [
      {
        id: "audience-segment",
        label: "Audience Segment",
        href: "/audiences",
      },
      {
        id: "import-audience",
        label: "Import Audience",
        href: "/audiences/import",
      },
    ],
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

function normalizePath(path: string): string {
  return path.replace(/\/$/, "") || "/";
}

export function isMenuPathActive(pathname: string, href: string): boolean {
  const current = normalizePath(pathname);
  const target = normalizePath(href);
  return current === target || current.startsWith(`${target}/`);
}

export function isMenuChildActive(
  pathname: string,
  href: string,
  siblingHrefs: string[] = [],
): boolean {
  const current = normalizePath(pathname);
  const target = normalizePath(href);

  if (current === target) {
    return true;
  }

  if (!current.startsWith(`${target}/`)) {
    return false;
  }

  return !siblingHrefs.some((sibling) => {
    const siblingPath = normalizePath(sibling);
    if (siblingPath === target || !siblingPath.startsWith(`${target}/`)) {
      return false;
    }

    return current === siblingPath || current.startsWith(`${siblingPath}/`);
  });
}

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
  "/templates/create": ["Message Templates", "Create"],
  "/templates/[id]/edit": ["Message Templates", "Edit"],
  "/auto-message": ["Auto Message"],
  "/line-users": ["LINE Users"],
  "/audiences": ["Audience Management", "Audience Segment"],
  "/audiences/import": ["Audience Management", "Import Audience"],
  "/audiences/create": ["Audience Management", "Audience Segment", "Create"],
  "/audiences/[id]/edit": ["Audience Management", "Audience Segment", "Edit"],
  "/audiences/[id]/view": ["Audience Management", "Audience Segment", "View"],
  "/rich-menu": ["Rich Menu"],
  "/rich-menu/create": ["Rich Menu", "Create"],
  "/rich-menu/[id]/edit": ["Rich Menu", "Edit"],
  "/settings": ["LINE OA Settings"],
  "/user-settings": ["User Settings"],
};
