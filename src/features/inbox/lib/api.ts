import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import {
  Conversation,
  ConversationQuery,
  ConversationStatus,
  InboxAgent,
  InboxMessage,
  InboxSummary,
  Page,
} from "../types";

async function request<T>(
  url: string,
  fallbackMessage: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await assertOkResponse(response, fallbackMessage);
  return response.json();
}

export function fetchConversations(
  query: ConversationQuery,
  cursor?: string,
): Promise<Page<Conversation>> {
  const params = new URLSearchParams({ status: query.status });
  if (query.assignee !== "all") params.set("assignee", query.assignee);
  if (query.search.trim()) params.set("search", query.search.trim());
  if (cursor) params.set("cursor", cursor);

  return request(
    `${API_ENDPOINTS.INBOX.CONVERSATIONS}?${params.toString()}`,
    "Failed to load conversations",
  );
}

export function fetchConversation(id: string): Promise<Conversation> {
  return request(
    API_ENDPOINTS.INBOX.CONVERSATION(id),
    "Failed to load conversation",
  );
}

export function fetchMessages(
  conversationId: string,
  before?: string,
): Promise<Page<InboxMessage>> {
  const params = new URLSearchParams();
  if (before) params.set("before", before);
  const query = params.toString();

  return request(
    `${API_ENDPOINTS.INBOX.MESSAGES(conversationId)}${query ? `?${query}` : ""}`,
    "Failed to load messages",
  );
}

export function sendMessage(
  conversationId: string,
  text: string,
): Promise<InboxMessage> {
  return request(
    API_ENDPOINTS.INBOX.MESSAGES(conversationId),
    "Failed to send message",
    { method: "POST", body: JSON.stringify({ text }) },
  );
}

export function updateConversation(
  conversationId: string,
  payload: { status?: ConversationStatus; assigneeId?: string | null },
): Promise<Conversation> {
  return request(
    API_ENDPOINTS.INBOX.CONVERSATION(conversationId),
    "Failed to update conversation",
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export function markConversationRead(conversationId: string): Promise<void> {
  return request(
    API_ENDPOINTS.INBOX.READ(conversationId),
    "Failed to mark conversation as read",
    { method: "POST" },
  );
}

export function fetchInboxSummary(): Promise<InboxSummary> {
  return request(API_ENDPOINTS.INBOX.SUMMARY, "Failed to load inbox summary");
}

export function fetchInboxAgents(): Promise<InboxAgent[]> {
  return request(API_ENDPOINTS.INBOX.AGENTS, "Failed to load agents");
}
