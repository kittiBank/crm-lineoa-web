import { TemplateMessageBlock } from "./builder";

export type MessageTemplateType =
  | "text"
  | "image"
  | "video"
  | "flex"
  | "carousel"
  | "multi";

/**
 * Message Template types
 */
export interface MessageTemplate {
  id: string;
  name: string;
  description: string | null;
  type: MessageTemplateType;
  category: string;
  messages: TemplateMessageBlock[];
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageTemplatePayload {
  name: string;
  description?: string;
  category: string;
  messages: TemplateMessageBlock[];
  isActive?: boolean;
}

export interface TemplateCategory {
  id: string;
  name: string;
  count: number;
}
