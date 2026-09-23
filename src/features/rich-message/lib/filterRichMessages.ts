import { RichMessageFilterOptions, RichMessageRecord } from "../types";

export function filterRichMessages(
  messages: RichMessageRecord[],
  filters: RichMessageFilterOptions,
): RichMessageRecord[] {
  return messages.filter((message) => {
    if (filters.status !== "all") {
      const matchesStatus =
        filters.status === "active" ? message.isActive : !message.isActive;
      if (!matchesStatus) {
        return false;
      }
    }

    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.trim().toLowerCase();
      const matchesSearch =
        message.name.toLowerCase().includes(query) ||
        (message.description ?? "").toLowerCase().includes(query);
      if (!matchesSearch) {
        return false;
      }
    }

    return true;
  });
}
