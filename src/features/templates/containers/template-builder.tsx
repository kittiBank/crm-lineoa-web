"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { FormActionFooter } from "@/components/ui/form-footer";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/hooks/useToast";
import {
  LineOaPreview,
  MessageBlockEditor,
  MessageBlockList,
  MessageTypePicker,
  FieldError,
  RequiredMark,
} from "@/features/templates/components";
import { errorInputClassName, MessageFieldErrors } from "@/features/templates/components/form-field";
import {
  createTemplate,
  fetchTemplateById,
  updateTemplate,
} from "@/features/templates/lib/api";
import {
  createMessageBlock,
  normalizeTemplateMessages,
  toPersistableMessages,
} from "@/features/templates/lib/create-message";
import { parseFlexSimulatorJson } from "@/features/templates/lib/flex-json";
import {
  MAX_TEMPLATE_MESSAGES,
  TEMPLATE_CATEGORIES,
} from "@/features/templates/lib/message-types";
import {
  TemplateMessageBlock,
  TemplateMessageType,
} from "@/features/templates/types/builder";

const inputClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

type TemplateFormErrors = {
  name?: string;
  addMessage?: string;
  messages?: string;
  messageFields: Record<string, MessageFieldErrors>;
};

const emptyFormErrors = (): TemplateFormErrors => ({
  messageFields: {},
});

interface TemplateBuilderContainerProps {
  templateId?: string;
  mode?: "create" | "edit" | "view";
}

export function TemplateBuilderContainer({
  templateId,
  mode,
}: TemplateBuilderContainerProps) {
  const router = useRouter();
  const toast = useToast();
  const resolvedMode = mode ?? (templateId ? "edit" : "create");
  const isViewMode = resolvedMode === "view";
  const isEditMode = resolvedMode === "edit";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(TEMPLATE_CATEGORIES[0]);
  const [messages, setMessages] = useState<TemplateMessageBlock[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(
    Boolean(templateId),
  );
  const [errors, setErrors] = useState<TemplateFormErrors>(emptyFormErrors);

  const selectedMessage = useMemo(
    () => messages.find((message) => message.id === selectedMessageId) ?? null,
    [messages, selectedMessageId],
  );

  useEffect(() => {
    if (!templateId) {
      return;
    }

    let isCancelled = false;

    const loadTemplate = async () => {
      setIsLoadingTemplate(true);
      try {
        const template = await fetchTemplateById(templateId);
        if (isCancelled) {
          return;
        }

        setName(template.name);
        setDescription(template.description ?? "");
        setCategory(template.category);
        const normalizedMessages = normalizeTemplateMessages(
          template.messages as TemplateMessageBlock[],
        );

        setMessages(normalizedMessages);
        setSelectedMessageId(normalizedMessages[0]?.id ?? null);

        if (normalizedMessages.length === 0) {
          setErrors({
            ...emptyFormErrors(),
            messages:
              "This template has no valid message blocks. Please add messages and save again.",
          });
        }
      } catch (error) {
        if (isCancelled) {
          return;
        }

        toast.error(
          error instanceof Error ? error.message : "Failed to load template",
        );
        router.push("/templates");
      } finally {
        if (!isCancelled) {
          setIsLoadingTemplate(false);
        }
      }
    };

    loadTemplate();

    return () => {
      isCancelled = true;
    };
  }, [templateId]);

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Message Templates", href: "/templates" },
    {
      label: isViewMode ? "View" : isEditMode ? "Edit" : "Create",
      isActive: true,
    },
  ];

  const handleAddMessage = (type: TemplateMessageType) => {
    if (messages.length >= MAX_TEMPLATE_MESSAGES) {
      setErrors((current) => ({
        ...current,
        addMessage: `A template can contain up to ${MAX_TEMPLATE_MESSAGES} messages`,
      }));
      return;
    }

    const nextMessage = createMessageBlock(type);
    setMessages((current) => [...current, nextMessage]);
    setSelectedMessageId(nextMessage.id);
    setErrors((current) => ({
      ...current,
      addMessage: undefined,
      messages: undefined,
    }));
  };

  const handleUpdateMessage = (updatedMessage: TemplateMessageBlock) => {
    setMessages((current) =>
      current.map((message) =>
        message.id === updatedMessage.id ? updatedMessage : message,
      ),
    );
    setErrors((current) => {
      if (!current.messageFields[updatedMessage.id]) {
        return current;
      }

      const messageFields = { ...current.messageFields };
      delete messageFields[updatedMessage.id];
      return { ...current, messageFields };
    });
  };

  const handleMoveMessage = (id: string, direction: "up" | "down") => {
    setMessages((current) => {
      const index = current.findIndex((message) => message.id === id);
      if (index === -1) {
        return current;
      }

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const handleRemoveMessage = (id: string) => {
    setMessages((current) => current.filter((message) => message.id !== id));
    setSelectedMessageId((current) => (current === id ? null : current));
    setErrors((current) => {
      const messageFields = { ...current.messageFields };
      delete messageFields[id];
      return { ...current, messageFields };
    });
  };

  const validateForm = () => {
    const nextErrors = emptyFormErrors();

    if (!name.trim()) {
      nextErrors.name = "Template name is required";
    }

    if (messages.length === 0) {
      nextErrors.messages = "Add at least one message block";
    }

    if (messages.length > MAX_TEMPLATE_MESSAGES) {
      nextErrors.addMessage = `A template can contain up to ${MAX_TEMPLATE_MESSAGES} messages`;
    }

    for (const message of messages) {
      const fieldErrors: MessageFieldErrors = {};

      if (message.type === "text" && !message.text.trim()) {
        fieldErrors.text = "Message text is required";
      }

      if (message.type === "image" && !message.imageUrl.trim()) {
        fieldErrors.imageUrl = "Image URL is required";
      }

      if (message.type === "video" && !message.videoUrl.trim()) {
        fieldErrors.videoUrl = "Please upload a video";
      }

      if (message.type === "carousel" && !message.altText.trim()) {
        fieldErrors.altText = "Alt text is required";
      }

      if (message.type === "flex") {
        const parsed = parseFlexSimulatorJson(message.contentsJson ?? "");
        if (!parsed.ok) {
          fieldErrors.contentsJson = parsed.error;
        }

        const altText = parsed.ok
          ? parsed.altText?.trim() || message.altText.trim()
          : message.altText.trim();

        if (!altText) {
          fieldErrors.altText = "Alt text is required";
        } else if (altText.length > 400) {
          fieldErrors.altText = "Alt text must be 400 characters or fewer";
        }
      }

      if (Object.keys(fieldErrors).length > 0) {
        nextErrors.messageFields[message.id] = fieldErrors;
      }
    }

    setErrors(nextErrors);

    const firstInvalidId = Object.keys(nextErrors.messageFields)[0];
    if (firstInvalidId) {
      setSelectedMessageId(firstInvalidId);
    }

    return (
      !nextErrors.name &&
      !nextErrors.messages &&
      !nextErrors.addMessage &&
      Object.keys(nextErrors.messageFields).length === 0
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        messages: toPersistableMessages(messages),
      };

      if (isEditMode && templateId) {
        await updateTemplate(templateId, payload);
        toast.success(`Template "${name.trim()}" updated successfully`);
      } else {
        await createTemplate(payload);
        toast.success(`Template "${name.trim()}" saved successfully`);
      }

      router.push("/templates");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save template",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingTemplate) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading template...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isViewMode
              ? "View Message Template"
              : isEditMode
                ? "Edit Message Template"
                : "Create Message Template"}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isViewMode
              ? "Review template details and message preview"
              : "Build LINE OA broadcast messages with live preview. Text and Flex messages support merge tags such as {lineUser} and {userTier}."}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Template info
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Template name <RequiredMark />
                </label>
                <Input
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (errors.name) {
                      setErrors((current) => ({ ...current, name: undefined }));
                    }
                  }}
                  className={`${inputClassName} ${errors.name ? errorInputClassName : ""}`}
                  placeholder="Summer campaign message"
                  readOnly={isViewMode}
                  aria-invalid={Boolean(errors.name)}
                />
                <FieldError message={errors.name} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className={inputClassName}
                  disabled={isViewMode}
                >
                  {TEMPLATE_CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className={`${inputClassName} resize-none`}
                  placeholder="Optional notes about this template"
                  readOnly={isViewMode}
                />
              </div>
            </div>
          </section>

          {!isViewMode && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                Add message
              </h2>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Choose a LINE message type to add to this broadcast template (
                {messages.length}/{MAX_TEMPLATE_MESSAGES})
              </p>
              <MessageTypePicker
                onAdd={handleAddMessage}
                disabled={messages.length >= MAX_TEMPLATE_MESSAGES}
              />
              <FieldError message={errors.addMessage} />
            </section>
          )}

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Message blocks <RequiredMark />
            </h2>
            <MessageBlockList
              messages={messages}
              selectedId={selectedMessageId}
              onSelect={setSelectedMessageId}
              onMoveUp={(id) => handleMoveMessage(id, "up")}
              onMoveDown={(id) => handleMoveMessage(id, "down")}
              onRemove={handleRemoveMessage}
              readOnly={isViewMode}
              errorIds={Object.keys(errors.messageFields)}
            />
            <FieldError message={errors.messages} />
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {isViewMode ? "Selected message" : "Edit selected message"}
            </h2>
            <MessageBlockEditor
              message={selectedMessage}
              onChange={handleUpdateMessage}
              readOnly={isViewMode}
              errors={
                selectedMessage
                  ? errors.messageFields[selectedMessage.id]
                  : undefined
              }
            />
          </section>
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
              LINE OA Preview
            </h2>
            <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
              See how messages will appear in the chat screen
            </p>
            <LineOaPreview messages={messages} templateName={name} />
          </section>
        </div>
      </div>

      <FormActionFooter
        mode={isViewMode ? "view" : isEditMode ? "edit" : "create"}
        cancelHref="/templates"
        onSave={handleSubmit}
        isSubmitting={isSubmitting}
        createSaveLabel="Save Template"
        editSaveLabel="Save Changes"
        savingLabel="Saving..."
      />
    </div>
  );
}
