export type RichMenuActionType =
  | "postback"
  | "message"
  | "uri"
  | "datetimepicker"
  | "richmenuswitch";

/** sub = tab/switch target only: never default, never linked to members */
export type RichMenuMenuType = "default" | "member" | "sub";

/** targetRichMenuId value meaning "the menu being created/edited" */
export const RICH_MENU_SWITCH_SELF_TARGET = "self";

export type RichMenuSizeMode = "big" | "compact" | "custom";

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
  /** richmenuswitch only: target menu id or RICH_MENU_SWITCH_SELF_TARGET */
  targetRichMenuId?: string;
  bounds: RichMenuBounds;
}

export interface RichMenuLayout {
  id: RichMenuSizeMode | string;
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
  aliasId?: string | null;
  isActive: boolean;
  sizeWidth: number;
  sizeHeight: number;
  createdAt: string;
}

export interface RichMenuDetail extends RichMenuRecord {
  areas: RichMenuAreaConfig[];
}

export interface RichMenuFilterOptions {
  searchQuery: string;
  menuType: RichMenuMenuType | "all";
  status: "all" | "active" | "inactive";
}

export const DEFAULT_RICH_MENU_FILTERS: RichMenuFilterOptions = {
  searchQuery: "",
  menuType: "all",
  status: "all",
};

export interface CreateRichMenuPayload {
  name: string;
  menuType: RichMenuMenuType;
  chatBarText: string;
  layoutId: string;
  areas: RichMenuAreaConfig[];
  image: File;
  /** Edit mode: menu replaced by this one (keeps its switch alias) */
  replaceRichMenuId?: string;
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
  {
    value: "richmenuswitch",
    label: "Switch menu",
    description: "Switch to another rich menu (e.g. tabs)",
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
  {
    value: "sub",
    label: "Tab / Sub menu",
    description: "Only shown when a user taps a Switch menu area",
  },
];

export const MENU_TYPE_BADGE_LABEL: Record<RichMenuMenuType, string> = {
  default: "Guest",
  member: "Member",
  sub: "Tab",
};

export const LINE_RICH_MENU_MAX_AREAS = 20;
export const LINE_RICH_MENU_MIN_DRAW_SIZE = 40;
