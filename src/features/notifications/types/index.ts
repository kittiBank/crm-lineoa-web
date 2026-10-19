/**
 * Admin bell notifications
 */

export type NotificationType = "CONVERSATION_ASSIGNED";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  conversationId: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPage {
  items: AppNotification[];
  nextCursor: string | null;
  unread: number;
}
