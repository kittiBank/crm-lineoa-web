"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessagesSquare } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { getStoredUserId } from "@/lib/auth";
import { useToast } from "@/lib/hooks/useToast";
import { ChatThread } from "../components/chat-thread";
import { ConversationDetails } from "../components/conversation-details";
import { ConversationList } from "../components/conversation-list";
import {
  fetchConversation,
  fetchConversations,
  fetchInboxAgents,
  fetchInboxSummary,
  fetchMessages,
  markConversationRead,
  sendMessage,
  updateConversation,
} from "../lib/api";
import { agentLabel } from "../lib/format";
import { usePolling } from "../lib/use-polling";
import {
  Conversation,
  ConversationQuery,
  ConversationStatus,
  InboxAgent,
  InboxMessage,
  InboxSummary,
} from "../types";

const LIST_POLL_MS = 15_000;
const THREAD_POLL_MS = 5_000;
const SEARCH_DEBOUNCE_MS = 300;

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

/** Merge by id, keeping chronological order. */
function mergeMessages(current: InboxMessage[], incoming: InboxMessage[]) {
  const byId = new Map(current.map((message) => [message.id, message]));
  for (const message of incoming) byId.set(message.id, message);
  return [...byId.values()].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() ||
      a.id.localeCompare(b.id),
  );
}

/** Fresh first page wins; pages loaded with "Load more" are kept below it. */
function mergeConversations(current: Conversation[], fresh: Conversation[]) {
  const freshIds = new Set(fresh.map((item) => item.id));
  return [...fresh, ...current.slice(fresh.length).filter((item) => !freshIds.has(item.id))];
}

export function InboxContainer() {
  const toast = useToast();
  const [currentUserId] = useState(getStoredUserId);

  const [query, setQuery] = useState<ConversationQuery>({
    status: "OPEN",
    assignee: "all",
    search: "",
  });
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [summary, setSummary] = useState<InboxSummary | null>(null);
  const [agents, setAgents] = useState<InboxAgent[]>([]);

  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [olderCursor, setOlderCursor] = useState<string | null>(null);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Drops responses for a conversation the agent already left.
  const selectedIdRef = useRef<string | null>(null);

  const currentAgent = agents.find((agent) => agent.id === currentUserId);
  const isAdmin = currentAgent?.role === "admin";

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const refreshSummary = useCallback(async () => {
    try {
      setSummary(await fetchInboxSummary());
    } catch {
      // Counts are decoration; the list shows real errors.
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    fetchConversations(debouncedQuery)
      .then((page) => {
        if (isCancelled) return;
        setConversations(page.items);
        setNextCursor(page.nextCursor);
      })
      .catch((error) => {
        if (!isCancelled) {
          toast.error(errorMessage(error, "Failed to load conversations"));
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoadingList(false);
      });

    return () => {
      isCancelled = true;
    };
    // toast is stable in practice; keep the effect keyed on the query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  useEffect(() => {
    fetchInboxSummary()
      .then(setSummary)
      .catch(() => undefined);
    fetchInboxAgents()
      .then(setAgents)
      .catch((error) =>
        toast.error(errorMessage(error, "Failed to load agents")),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  usePolling(async () => {
    const queryAtStart = debouncedQuery;
    try {
      const page = await fetchConversations(queryAtStart);
      setConversations((current) => mergeConversations(current, page.items));
    } catch {
      // Next tick retries.
    }
    void refreshSummary();
  }, LIST_POLL_MS);

  const handleLoadMore = async () => {
    if (!nextCursor) return;
    setIsLoadingMore(true);
    try {
      const page = await fetchConversations(debouncedQuery, nextCursor);
      setConversations((current) => [
        ...current,
        ...page.items.filter((item) => !current.some((row) => row.id === item.id)),
      ]);
      setNextCursor(page.nextCursor);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to load conversations"));
    } finally {
      setIsLoadingMore(false);
    }
  };

  const applyConversation = (conversation: Conversation) => {
    if (selectedIdRef.current === conversation.id) setSelected(conversation);
    setConversations((current) =>
      current.map((item) => (item.id === conversation.id ? conversation : item)),
    );
  };

  const markRead = async (conversation: Conversation) => {
    if (conversation.unreadCount === 0) return;
    try {
      await markConversationRead(conversation.id);
      applyConversation({ ...conversation, unreadCount: 0 });
      void refreshSummary();
    } catch {
      // Unread badge stays; not worth interrupting the agent.
    }
  };

  const handleSelect = async (id: string) => {
    if (selectedIdRef.current === id) return;
    selectedIdRef.current = id;

    const fromList = conversations.find((item) => item.id === id) ?? null;
    setSelected(fromList);
    setMessages([]);
    setOlderCursor(null);
    setIsLoadingThread(true);

    try {
      const [conversation, page] = await Promise.all([
        fetchConversation(id),
        fetchMessages(id),
      ]);
      if (selectedIdRef.current !== id) return;
      setSelected(conversation);
      setMessages(page.items);
      setOlderCursor(page.nextCursor);
      void markRead(conversation);
    } catch (error) {
      if (selectedIdRef.current === id) {
        toast.error(errorMessage(error, "Failed to load conversation"));
      }
    } finally {
      if (selectedIdRef.current === id) setIsLoadingThread(false);
    }
  };

  usePolling(
    async () => {
      const id = selectedIdRef.current;
      if (!id) return;
      try {
        const [conversation, page] = await Promise.all([
          fetchConversation(id),
          fetchMessages(id),
        ]);
        if (selectedIdRef.current !== id) return;
        applyConversation(conversation);
        setMessages((current) => mergeMessages(current, page.items));
        void markRead(conversation);
      } catch {
        // Next tick retries.
      }
    },
    THREAD_POLL_MS,
    Boolean(selected),
  );

  const handleLoadOlder = async () => {
    const id = selectedIdRef.current;
    if (!id || !olderCursor || isLoadingOlder) return;
    setIsLoadingOlder(true);
    try {
      const page = await fetchMessages(id, olderCursor);
      if (selectedIdRef.current !== id) return;
      setMessages((current) => mergeMessages(current, page.items));
      setOlderCursor(page.nextCursor);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to load older messages"));
    } finally {
      setIsLoadingOlder(false);
    }
  };

  const handleSend = async (text: string) => {
    const id = selectedIdRef.current;
    if (!id) return false;
    try {
      const message = await sendMessage(id, text);
      setMessages((current) => mergeMessages(current, [message]));
      // First reply may have assigned the chat to this agent.
      applyConversation(await fetchConversation(id));
      void refreshSummary();
      return true;
    } catch (error) {
      toast.error(errorMessage(error, "Failed to send message"));
      return false;
    }
  };

  const handleUpdate = async (payload: {
    status?: ConversationStatus;
    assigneeId?: string | null;
  }) => {
    if (!selected) return;
    setIsUpdating(true);
    try {
      const updated = await updateConversation(selected.id, payload);
      applyConversation(updated);
      void refreshSummary();
      toast.success(
        payload.status
          ? `Conversation marked as ${payload.status.toLowerCase()}`
          : updated.assignee
            ? `Assigned to ${agentLabel(updated.assignee)}`
            : "Conversation unassigned",
      );
    } catch (error) {
      toast.error(errorMessage(error, "Failed to update conversation"));
    } finally {
      setIsUpdating(false);
    }
  };

  const canManage = Boolean(
    selected &&
      (!selected.assignee || selected.assignee.id === currentUserId || isAdmin),
  );

  const replyBlockedReason = useMemo(() => {
    if (!selected) return null;
    if (selected.lineUser.status !== "following") {
      return "This user has blocked your LINE OA and can't receive messages.";
    }
    if (selected.assignee && selected.assignee.id !== currentUserId) {
      return `Assigned to ${agentLabel(selected.assignee)}. Only they can reply.`;
    }
    return null;
  }, [selected, currentUserId]);

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard" },
          { label: "Inbox", isActive: true },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inbox</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Chat 1:1 with your LINE followers, assign conversations, and track their status
        </p>
      </div>

      <div className="grid h-[calc(100vh-15rem)] min-h-[32rem] grid-cols-[18rem_minmax(0,1fr)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm xl:grid-cols-[20rem_minmax(0,1fr)_17rem] dark:border-gray-700 dark:bg-gray-800">
        <div className="min-h-0 border-r border-gray-200 dark:border-gray-700">
          <ConversationList
            conversations={conversations}
            query={query}
            summary={summary}
            selectedId={selected?.id ?? null}
            currentUserId={currentUserId}
            isLoading={isLoadingList}
            isLoadingMore={isLoadingMore}
            hasMore={Boolean(nextCursor)}
            onQueryChange={(next) => {
              if (next.status !== query.status || next.assignee !== query.assignee) {
                setIsLoadingList(true);
              }
              setQuery(next);
            }}
            onSelect={(id) => void handleSelect(id)}
            onLoadMore={() => void handleLoadMore()}
          />
        </div>

        {selected ? (
          <>
            <div className="flex min-h-0 flex-col">
              <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {selected.lineUser.displayName ?? "Unknown user"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selected.assignee
                    ? `Assigned to ${selected.assignee.id === currentUserId ? "you" : agentLabel(selected.assignee)}`
                    : "Unassigned — your first reply assigns it to you"}
                </p>
              </div>
              <div className="min-h-0 flex-1">
                <ChatThread
                  conversationId={selected.id}
                  messages={messages}
                  isLoading={isLoadingThread}
                  hasOlder={Boolean(olderCursor)}
                  isLoadingOlder={isLoadingOlder}
                  replyBlockedReason={replyBlockedReason}
                  onLoadOlder={() => void handleLoadOlder()}
                  onSend={handleSend}
                />
              </div>
            </div>
            <div className="hidden min-h-0 border-l border-gray-200 xl:block dark:border-gray-700">
              <ConversationDetails
                conversation={selected}
                agents={agents}
                currentUserId={currentUserId}
                canManage={canManage}
                isUpdating={isUpdating}
                onUpdate={(payload) => void handleUpdate(payload)}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-center text-sm text-gray-500 xl:col-span-2 dark:text-gray-400">
            <MessagesSquare className="h-8 w-8" />
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
