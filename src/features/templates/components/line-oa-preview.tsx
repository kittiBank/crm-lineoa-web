"use client";

import { Play, User } from "lucide-react";
import { TemplateMessageBlock } from "../types/builder";

interface LineOaPreviewProps {
  messages: TemplateMessageBlock[];
  templateName: string;
}

export function LineOaPreview({ messages, templateName }: LineOaPreviewProps) {
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="overflow-hidden rounded-[2rem] border border-gray-300 bg-[#7d9bbb] shadow-xl dark:border-gray-600">
        <div className="bg-[#273443] px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">CRM LINE OA</p>
              <p className="text-xs text-white/70">Official Account</p>
            </div>
          </div>
        </div>

        <div className="min-h-[520px] space-y-3 px-3 py-4">
          {messages.length === 0 ? (
            <div className="rounded-2xl bg-white/90 px-4 py-6 text-center text-sm text-gray-500">
              Preview will appear here when you add messages.
            </div>
          ) : (
            messages.map((message) => (
              <PreviewBubble key={message.id} message={message} />
            ))
          )}
        </div>

        <div className="border-t border-white/20 bg-[#6f8fad] px-4 py-2 text-center text-[11px] text-white/80">
          {templateName.trim() || "Untitled template"}
        </div>
      </div>
    </div>
  );
}

function PreviewBubble({ message }: { message: TemplateMessageBlock }) {
  switch (message.type) {
    case "text":
      return (
        <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white px-4 py-3 text-sm leading-relaxed text-gray-900 shadow-sm">
          {message.text || "Text message preview"}
        </div>
      );
    case "image":
      return (
        <div className="max-w-[85%] overflow-hidden rounded-2xl rounded-tl-md bg-white shadow-sm">
          {message.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={message.imageUrl}
              alt="Preview"
              className="max-h-56 w-full object-cover"
            />
          ) : (
            <div className="flex h-40 items-center justify-center bg-gray-100 text-sm text-gray-400">
              Image preview
            </div>
          )}
        </div>
      );
    case "video":
      return (
        <div className="max-w-[85%] overflow-hidden rounded-2xl rounded-tl-md bg-white shadow-sm">
          {message.previewImageUrl ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={message.previewImageUrl}
                alt="Video preview"
                className="max-h-56 w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white">
                  <Play className="h-5 w-5" />
                </span>
              </div>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center bg-gray-900 text-sm text-white/80">
              <Play className="mr-2 h-4 w-4" />
              Video preview
            </div>
          )}
        </div>
      );
    case "flex":
      return (
        <div className="max-w-[85%] overflow-hidden rounded-2xl rounded-tl-md bg-white shadow-sm">
          {message.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={message.imageUrl}
              alt={message.title}
              className="h-36 w-full object-cover"
            />
          ) : (
            <div className="flex h-36 items-center justify-center bg-gray-100 text-sm text-gray-400">
              Flex image
            </div>
          )}
          <div className="space-y-2 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">
              {message.title || "Flex title"}
            </p>
            <p className="text-xs leading-relaxed text-gray-600">
              {message.description || "Flex description"}
            </p>
            <button
              type="button"
              className="w-full rounded-lg bg-[#06c755] px-3 py-2 text-sm font-medium text-white"
            >
              {message.buttonLabel || "Button"}
            </button>
          </div>
        </div>
      );
    case "carousel":
      return (
        <div className="max-w-full">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {message.columns.map((column) => (
              <div
                key={column.id}
                className="w-44 shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                {column.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={column.imageUrl}
                    alt={column.title}
                    className="h-24 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-24 items-center justify-center bg-gray-100 text-xs text-gray-400">
                    Image
                  </div>
                )}
                <div className="space-y-1 px-3 py-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {column.title}
                  </p>
                  <p className="line-clamp-2 text-xs text-gray-600">
                    {column.text}
                  </p>
                  <p className="pt-1 text-xs font-medium text-[#06c755]">
                    {column.actionLabel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}
