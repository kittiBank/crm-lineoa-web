import { AutoMessage } from "../types";

export function searchAutoMessages(
  items: AutoMessage[],
  query: string,
): AutoMessage[] {
  if (!query.trim()) return items;
  const q = query.toLowerCase();
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.keyword.toLowerCase().includes(q),
  );
}

export function filterByMatchType(
  items: AutoMessage[],
  matchType: string,
): AutoMessage[] {
  if (matchType === "All") return items;
  return items.filter((item) => item.matchType === matchType);
}

export function filterByStatus(
  items: AutoMessage[],
  status: "all" | "active" | "inactive",
): AutoMessage[] {
  if (status === "all") return items;
  return items.filter((item) =>
    status === "active" ? item.isActive : !item.isActive,
  );
}
