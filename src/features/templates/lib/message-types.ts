import { MessageTypeOption, TemplateMessageType } from "../types/builder";

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
    type: "flex",
    label: "Flex",
    description: "Rich card with image & button",
  },
  {
    type: "carousel",
    label: "Carousel",
    description: "Swipeable cards",
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
  return MESSAGE_TYPE_OPTIONS.find((option) => option.type === type)?.label ?? type;
}
