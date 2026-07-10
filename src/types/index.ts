/**
 * Menu item type for navigation
 */
export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

/**
 * Breadcrumb item type
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

/**
 * User type for authentication
 */
export interface User {
  id: string;
  email: string;
  role: "admin" | "user";
}
