export type RichMessageActionType = "message" | "uri";

export interface RichMessageBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RichMessageAreaConfig {
  actionType: RichMessageActionType;
  text?: string;
  uri?: string;
  bounds: RichMessageBounds;
}

export interface RichMessageBlock {
  type: "imagemap";
  imageUrl?: string;
  altText?: string;
  baseUrl?: string;
  baseSize?: { width: number; height: number };
  areas: RichMessageAreaConfig[];
}

export interface RichMessageRecord {
  id: string;
  name: string;
  description: string | null;
  category: string;
  isActive: boolean;
  usageCount: number;
  messages: RichMessageBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface RichMessageFilterOptions {
  searchQuery: string;
  status: "all" | "active" | "inactive";
}

export const DEFAULT_RICH_MESSAGE_FILTERS: RichMessageFilterOptions = {
  searchQuery: "",
  status: "all",
};

export const ACTION_TYPE_OPTIONS: {
  value: RichMessageActionType;
  label: string;
  description: string;
}[] = [
  {
    value: "uri",
    label: "Link",
    description: "Open a URL in browser",
  },
  {
    value: "message",
    label: "Message",
    description: "Send a text message when tapped",
  },
];
