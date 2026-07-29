export type AutoMessageMatchType = "exact" | "contains" | "starts_with" | "ends_with";

export interface AutoMessageTemplateRef {
  id: string;
  name: string;
}

export interface AutoMessage {
  id: string;
  name: string;
  keyword: string;
  matchType: AutoMessageMatchType;
  templateId: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  template?: AutoMessageTemplateRef | null;
}

export interface CreateAutoMessagePayload {
  name: string;
  keyword: string;
  matchType: AutoMessageMatchType;
  templateId: string;
  priority: number;
  isActive: boolean;
}

export type UpdateAutoMessagePayload = Partial<CreateAutoMessagePayload>;

export const MATCH_TYPE_OPTIONS: {
  value: AutoMessageMatchType;
  label: string;
}[] = [
  { value: "exact", label: "Exact Match" },
  { value: "contains", label: "Contains" },
  { value: "starts_with", label: "Starts With" },
  { value: "ends_with", label: "Ends With" },
];
