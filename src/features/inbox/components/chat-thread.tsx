"use client";

import {
  Fragment,
  KeyboardEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Bot, Info, Loader2, SendHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  agentLabel,
  formatDayLabel,
  formatMessageTime,
} from "../lib/format";
import { InboxMessage } from "../types";

const MAX_TEXT_LENGTH = 5000;

const NON_TEXT_LABELS: Record<string, string> = {
  image: "Sent a photo",
  video: "Sent a video",
  audio: "Sent a voice message",
  file: "Sent a file",
  location: "Shared a location",
  sticker: "Sent a sticker",
  imagemap: "Rich message",
  flex: "Card message",
  template: "Template message",
};

function MessageBody({ message }: { message: InboxMessage }) {
  if (message.type === "text") {
    return <p className="break-words whitespace-pre-wrap">{message.content}</p>;
  }

  return (
    <p className="italic opacity-80">
      {NON_TEXT_LABELS[message.type] ?? `[${message.type}]`}
    </p>
  );
}

interface ChatThreadProps {
  conversationId: string;
  messages: InboxMessage[];
  isLoading: boolean;
  hasOlder: boolean;
  isLoadingOlder: boolean;
  /** Set when the current agent cannot reply, with the reason to show. */
  replyBlockedReason: string | null;
  onLoadOlder: () => void;
  onSend: (text: string) => Promise<boolean>;
}

export function ChatThread({
  conversationId,
  messages,
  isLoading,
  hasOlder,
  isLoadingOlder,
  replyBlockedReason,
  onLoadOlder,
  onSend,
}: ChatThreadProps) {
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const firstMessageIdRef = useRef<string | null>(null);
  const scrollHeightRef = useRef(0);

  // Draft belongs to one conversation.
  const [draftFor, setDraftFor] = useState(conversationId);
  if (draftFor !== conversationId) {
    setDraftFor(conversationId);
    setDraft("");
  }

  // Stick to the bottom for new messages; keep position when older ones load.
  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element || messages.length === 0) return;

    const firstId = messages[0]!.id;
    const lastId = messages[messages.length - 1]!.id;
    const prependedOlder =
      firstMessageIdRef.current !== null &&
      firstId !== firstMessageIdRef.current &&
      lastId === lastMessageIdRef.current;

    if (prependedOlder) {
      element.scrollTop += element.scrollHeight - scrollHeightRef.current;
    } else if (lastId !== lastMessageIdRef.current) {
      element.scrollTop = element.scrollHeight;
    }

    firstMessageIdRef.current = firstId;
    lastMessageIdRef.current = lastId;
    scrollHeightRef.current = element.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || isSending || replyBlockedReason) return;

    setIsSending(true);
    const sent = await onSend(text);
    setIsSending(false);
    if (sent) setDraft("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        onScroll={(event) => {
          scrollHeightRef.current = event.currentTarget.scrollHeight;
          if (event.currentTarget.scrollTop < 80 && hasOlder && !isLoadingOlder) {
            onLoadOlder();
          }
        }}
        className="min-h-0 flex-1 overflow-y-auto bg-gray-50 px-4 py-4 dark:bg-gray-900/40"
      >
        {isLoading && messages.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton
                key={index}
                className={cn(
                  "h-10 w-2/5 rounded-2xl",
                  index % 2 === 1 && "ml-auto",
                )}
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="pt-10 text-center text-sm text-gray-500 dark:text-gray-400">
            No messages yet
          </p>
        ) : (
          <div className="space-y-2">
            {isLoadingOlder && (
              <div className="flex justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            )}
            {messages.map((message, index) => {
              const previous = messages[index - 1];
              const showDay =
                !previous ||
                new Date(previous.createdAt).toDateString() !==
                  new Date(message.createdAt).toDateString();
              const isOutbound = message.direction === "outbound";

              return (
                <Fragment key={message.id}>
                  {showDay && (
                    <div className="flex justify-center py-2">
                      <span className="rounded-full bg-gray-200 px-3 py-0.5 text-[11px] text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {formatDayLabel(message.createdAt)}
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "flex flex-col",
                      isOutbound ? "items-end" : "items-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                        isOutbound
                          ? message.source === "auto_reply"
                            ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                            : "bg-blue-600 text-white"
                          : "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white",
                      )}
                    >
                      <MessageBody message={message} />
                    </div>
                    <span className="mt-0.5 flex items-center gap-1 px-1 text-[10px] text-gray-400">
                      {message.source === "auto_reply" && (
                        <>
                          <Bot className="h-3 w-3" /> Auto reply ·
                        </>
                      )}
                      {message.source === "agent" && message.sender && (
                        <>{agentLabel(message.sender)} ·</>
                      )}
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                </Fragment>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-3 dark:border-gray-700">
        {replyBlockedReason ? (
          <p className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2.5 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-300">
            <Info className="h-4 w-4 shrink-0" />
            {replyBlockedReason}
          </p>
        ) : (
          <>
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                maxLength={MAX_TEXT_LENGTH}
                placeholder="Type a reply… (Enter to send, Shift+Enter for a new line)"
                className="max-h-40 min-h-[2.75rem] flex-1 resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                disabled={isSending}
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={!draft.trim() || isSending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                aria-label="Send reply"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SendHorizontal className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-gray-400">
              Replies are sent as LINE push messages and count toward your
              monthly message quota.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
