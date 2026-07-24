import { BroadcastSendMode } from "../types";

export function toDatetimeLocalValue(isoDate: string | null): string {
  if (!isoDate) {
    return "";
  }

  const date = new Date(isoDate);
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function mapBroadcastStatusToSendMode(
  status: string,
): BroadcastSendMode {
  if (status === "scheduled") {
    return "schedule";
  }

  if (status === "draft") {
    return "draft";
  }

  return "now";
}

export function mapApiStatusToUiStatus(status: string): string {
  const statusMap: Record<string, string> = {
    completed: "Sent",
    scheduled: "Scheduled",
    draft: "Draft",
    failed: "Failed",
    processing: "Processing",
  };

  return statusMap[status] ?? status;
}

export function isDraftBroadcast(status: string): boolean {
  return status === "draft" || mapApiStatusToUiStatus(status) === "Draft";
}

export function isEditableApiStatus(status: string): boolean {
  return status === "draft" || status === "scheduled";
}

export function isManageableUiStatus(status: string): boolean {
  return status === "Draft" || status === "Scheduled";
}
