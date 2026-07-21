export type RichMenuActionType =
  | "postback"
  | "message"
  | "uri"
  | "datetimepicker";

export type RichMenuMenuType = "default" | "member";

export interface RichMenuBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RichMenuAreaConfig {
  label: string;
  actionType: RichMenuActionType;
  data?: string;
  text?: string;
  uri?: string;
  mode?: "date" | "time" | "datetime";
}

export interface RichMenuLayout {
  id: string;
  label: string;
  description: string;
  size: { width: number; height: number };
  rows: number;
  cols: number;
  cells: RichMenuBounds[];
}

export interface RichMenuRecord {
  id: string;
  name: string;
  menuType: RichMenuMenuType;
  chatBarText: string;
  imageUrl?: string | null;
  lineRichMenuId?: string | null;
  isActive: boolean;
  sizeWidth: number;
  sizeHeight: number;
  createdAt: string;
}

export interface CreateRichMenuPayload {
  name: string;
  menuType: RichMenuMenuType;
  chatBarText: string;
  layoutId: string;
  areas: RichMenuAreaConfig[];
  image: File;
}

export interface CreateRichMenuResponse {
  id?: string;
  lineRichMenuId: string;
  name: string;
  menuType: RichMenuMenuType;
  chatBarText: string;
  layoutId: string;
  imageUrl: string;
  isActive: boolean;
  appliedAsDefault: boolean;
}

export const ACTION_TYPE_OPTIONS: {
  value: RichMenuActionType;
  label: string;
  description: string;
}[] = [
  {
    value: "postback",
    label: "Postback",
    description: "Send data to webhook when tapped",
  },
  {
    value: "message",
    label: "Message",
    description: "Send a text message when tapped",
  },
  {
    value: "uri",
    label: "Link",
    description: "Open a URL in browser",
  },
  {
    value: "datetimepicker",
    label: "Date picker",
    description: "Open date/time picker",
  },
];

export const MENU_TYPE_OPTIONS: {
  value: RichMenuMenuType;
  label: string;
  description: string;
}[] = [
  {
    value: "default",
    label: "Default (Guest)",
    description: "Shown to all users who are not linked to a member menu",
  },
  {
    value: "member",
    label: "Member",
    description: "Linked to registered members individually",
  },
];
