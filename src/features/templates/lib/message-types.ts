import { MessageTypeOption, TemplateMessageType } from "../types/builder";

export const MAX_TEMPLATE_MESSAGES = 5;

export const MESSAGE_TYPE_OPTIONS: MessageTypeOption[] = [
  {
    type: "text",
    label: "Text",
    description: "Plain text message",
  },
  {
    type: "image",
    label: "Image",
    description: "Send a photo",
  },
  {
    type: "video",
    label: "Video",
    description: "Send a video clip",
  },
  {
    type: "carousel",
    label: "Carousel",
    description: "Swipeable cards",
  },
  {
    type: "flex",
    label: "Flex",
    description: "Paste LINE Flex Simulator JSON",
  },
];

export const TEMPLATE_CATEGORIES = [
  "Promotion",
  "Announcement",
  "Reminder",
  "Welcome",
  "Other",
];

export function getMessageTypeLabel(type: TemplateMessageType): string {
  return (
    MESSAGE_TYPE_OPTIONS.find((option) => option.type === type)?.label ?? type
  );
}
