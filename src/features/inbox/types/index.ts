/**
 * Inbox (1:1 chat) types
 */

export type ConversationStatus = "OPEN" | "PENDING" | "CLOSED";

export type ConversationStatusFilter = ConversationStatus | "ALL";

export type ConversationAssigneeFilter = "all" | "me" | "unassigned";

export interface InboxAgent {
  id: string;
  name: string | null;
  email: string;
  role?: string;
}

export interface Conversation {
  id: string;
  status: ConversationStatus;
  unreadCount: number;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  closedAt: string | null;
  assignee: InboxAgent | null;
  lineUser: {
    id: string;
    displayName: string | null;
    pictureUrl: string | null;
    status: string;
    userType: string;
    userTier: string | null;
    phone: string | null;
    followedAt: string | null;
    lastActivity: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InboxMessage {
  id: string;
  type: string;
  content: string;
  direction: "inbound" | "outbound";
  source: "user" | "agent" | "auto_reply";
  sender: InboxAgent | null;
  createdAt: string;
}

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export interface InboxSummary {
  open: number;
  pending: number;
  closed: number;
  unread: number;
  mine: number;
}

export interface ConversationQuery {
  status: ConversationStatusFilter;
  assignee: ConversationAssigneeFilter;
  search: string;
}

export const STATUS_LABELS: Record<ConversationStatus, string> = {
  OPEN: "Open",
  PENDING: "Pending",
  CLOSED: "Closed",
};

export const STATUS_TABS: { value: ConversationStatusFilter; label: string }[] =
  [
    { value: "OPEN", label: "Open" },
    { value: "PENDING", label: "Pending" },
    { value: "CLOSED", label: "Closed" },
    { value: "ALL", label: "All" },
  ];

export const ASSIGNEE_FILTERS: {
  value: ConversationAssigneeFilter;
  label: string;
}[] = [
  { value: "all", label: "Everyone" },
  { value: "me", label: "Mine" },
  { value: "unassigned", label: "Unassigned" },
];
