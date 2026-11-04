import { BroadcastMessageType, BroadcastStatusKey } from "../../types";

/** Display order follows the design: Sent first, Failed last. */
export const BROADCAST_STATUS_META: Record<
  BroadcastStatusKey,
  { label: string; color: string; badge: string; order: number }
> = {
  completed: { label: "Sent", color: "#2563EB", badge: "bg-[#EFF5FF] text-[#1D4ED8] dark:bg-blue-950/40 dark:text-blue-300", order: 0 },
  processing: { label: "In progress", color: "#60A5FA", badge: "bg-[#F3F8FF] text-[#1E40AF] dark:bg-blue-950/40 dark:text-blue-300", order: 1 },
  scheduled: { label: "Scheduled", color: "#BFDBFE", badge: "bg-[#F3F8FF] text-[#1E40AF] dark:bg-blue-950/40 dark:text-blue-300", order: 2 },
  draft: { label: "Draft", color: "#D4D4D4", badge: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300", order: 3 },
  failed: { label: "Failed", color: "#EA580C", badge: "bg-[#FFF4ED] text-[#B93815] dark:bg-orange-950/40 dark:text-orange-300", order: 4 },
};

export const BROADCAST_STATUS_ORDER = (
  Object.keys(BROADCAST_STATUS_META) as BroadcastStatusKey[]
).sort((a, b) => BROADCAST_STATUS_META[a].order - BROADCAST_STATUS_META[b].order);

export const MESSAGE_TYPE_LABELS: Record<BroadcastMessageType, string> = {
  text: "Text",
  image: "Image",
  video: "Video",
  flex: "Flex",
  carousel: "Carousel",
  imagemap: "Rich message",
  multi: "Multiple",
  none: "No template",
};
