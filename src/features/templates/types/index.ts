/**
 * Message Template types
 */
export interface MessageTemplate {
  id: string;
  name: string;
  description: string;
  type: "text" | "flex" | "carousel" | "rich_menu";
  content: string;
  createdAt: Date;
  updatedAt: Date;
  category: string;
  usageCount: number;
  isActive: boolean;
}

export interface TemplateCategory {
  id: string;
  name: string;
  count: number;
}
