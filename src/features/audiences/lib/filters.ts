import { Audience, AudienceSegmentType } from "../types";

export function searchAudiences(
  items: Audience[],
  query: string,
): Audience[] {
  if (!query.trim()) return items;
  const q = query.toLowerCase();
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      (item.description?.toLowerCase().includes(q) ?? false),
  );
}

export function filterAudiencesByType(
  items: Audience[],
  type: AudienceSegmentType | "All",
): Audience[] {
  if (type === "All") return items;
  return items.filter((item) => item.type === type);
}

export function filterAudiencesByStatus(
  items: Audience[],
  status: "all" | "active" | "inactive",
): Audience[] {
  if (status === "all") return items;
  return items.filter((item) =>
    status === "active" ? item.isActive : !item.isActive,
  );
}
