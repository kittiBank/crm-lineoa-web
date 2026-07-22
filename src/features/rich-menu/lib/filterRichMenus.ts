import { RichMenuFilterOptions, RichMenuRecord } from "../types";

export function filterRichMenus(
  menus: RichMenuRecord[],
  filters: RichMenuFilterOptions,
): RichMenuRecord[] {
  const query = filters.searchQuery.trim().toLowerCase();

  return menus.filter((menu) => {
    const matchesSearch =
      !query ||
      menu.name.toLowerCase().includes(query) ||
      menu.chatBarText.toLowerCase().includes(query);

    const matchesMenuType =
      filters.menuType === "all" || menu.menuType === filters.menuType;

    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "active" && menu.isActive) ||
      (filters.status === "inactive" && !menu.isActive);

    return matchesSearch && matchesMenuType && matchesStatus;
  });
}
