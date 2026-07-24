"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { FormActionFooter } from "@/components/ui/form-footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/lib/hooks/useToast";
import { LineOaPreview } from "@/features/templates/components";
import {
  fetchTemplateById,
  fetchTemplates,
} from "@/features/templates/lib/api";
import { normalizeTemplateMessages } from "@/features/templates/lib/create-message";
import { TemplateMessageBlock } from "@/features/templates/types/builder";
import { MessageTemplate } from "@/features/templates/types";
import {
  createBroadcast,
  fetchBroadcastAudiences,
  fetchBroadcastById,
  updateBroadcast,
} from "@/features/broadcasts/lib/api";
import {
  isEditableApiStatus,
  mapBroadcastStatusToSendMode,
  toDatetimeLocalValue,
} from "@/features/broadcasts/lib/broadcast-form";
import { clearBroadcastListDataCache } from "@/features/broadcasts/lib/load-broadcast-list-data";
import {
  BroadcastAudienceOption,
  BroadcastAudienceType,
  BroadcastSendMode,
  SEND_MODE_OPTIONS,
} from "@/features/broadcasts/types";

const inputClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

const readOnlyInputClassName = `${inputClassName} cursor-not-allowed bg-gray-50 dark:bg-gray-800/80`;

interface BroadcastBuilderContainerProps {
  broadcastId?: string;
  mode?: "create" | "edit" | "view";
}

export function BroadcastBuilderContainer({
  broadcastId,
  mode,
}: BroadcastBuilderContainerProps) {
  const router = useRouter();
  const toast = useToast();
  const resolvedMode = mode ?? (broadcastId ? "edit" : "create");
  const isViewMode = resolvedMode === "view";
  const isEditMode = resolvedMode === "edit";
  const isReadOnly = isViewMode;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [audienceType, setAudienceType] =
    useState<BroadcastAudienceType>("all");
  const [sendMode, setSendMode] = useState<BroadcastSendMode>("now");
  const [scheduledFor, setScheduledFor] = useState("");

  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [audiences, setAudiences] = useState<BroadcastAudienceOption[]>([]);
  const [previewMessages, setPreviewMessages] = useState<
    TemplateMessageBlock[]
  >([]);

  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isLoadingBroadcast, setIsLoadingBroadcast] = useState(
    Boolean(broadcastId),
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === templateId) ?? null,
    [templates, templateId],
  );

  const selectedAudience = useMemo(
    () => audiences.find((item) => item.value === audienceType) ?? null,
    [audiences, audienceType],
  );

  const pageTitle = isViewMode
    ? "View Broadcast"
    : isEditMode
      ? "Edit Broadcast"
      : "Create Broadcast";

  const pageDescription = isViewMode
    ? "Review broadcast details and preview"
    : isEditMode
      ? "Update your draft or scheduled broadcast"
      : "Compose a LINE OA broadcast, choose your audience, and preview before sending";

  const saveLabel = useMemo(() => {
    switch (sendMode) {
      case "now":
        return "Send Now";
      case "schedule":
        return "Schedule Broadcast";
      default:
        return "Save Draft";
    }
  }, [sendMode]);

  const savingLabel = useMemo(() => {
    switch (sendMode) {
      case "now":
        return "Sending...";
      case "schedule":
        return "Scheduling...";
      default:
        return "Saving...";
    }
  }, [sendMode]);

  useEffect(() => {
    let isCancelled = false;

    const loadOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const [templateList, audienceList] = await Promise.all([
          fetchTemplates(),
          fetchBroadcastAudiences(),
        ]);

        if (isCancelled) {
          return;
        }

        const activeTemplates = templateList.filter(
          (template) => template.isActive,
        );
        setTemplates(activeTemplates);
        setAudiences(audienceList);

        if (!broadcastId && activeTemplates.length > 0) {
          setTemplateId(activeTemplates[0].id);
        }
      } catch (error) {
        if (!isCancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to load form options",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingOptions(false);
        }
      }
    };

    loadOptions();

    return () => {
      isCancelled = true;
    };
  }, [broadcastId]);

  useEffect(() => {
    if (!broadcastId) {
      return;
    }

    let isCancelled = false;

    const loadBroadcast = async () => {
      setIsLoadingBroadcast(true);
      setLoadError(null);

      try {
        const broadcast = await fetchBroadcastById(broadcastId);
        if (isCancelled) {
          return;
        }

        if (isEditMode && !isEditableApiStatus(broadcast.status)) {
          setLoadError("Only draft or scheduled broadcasts can be edited.");
          return;
        }

        setTitle(broadcast.name);
        setDescription(broadcast.description ?? "");
        setTemplateId(broadcast.templateId ?? "");
        setAudienceType(broadcast.audienceType);
        setSendMode(mapBroadcastStatusToSendMode(broadcast.status));
        setScheduledFor(toDatetimeLocalValue(broadcast.scheduledFor));
      } catch (error) {
        if (!isCancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Failed to load broadcast",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingBroadcast(false);
        }
      }
    };

    loadBroadcast();

    return () => {
      isCancelled = true;
    };
  }, [broadcastId, isEditMode]);

  useEffect(() => {
    if (!templateId) {
      return;
    }

    let isCancelled = false;

    const loadPreview = async () => {
      setIsLoadingPreview(true);
      try {
        const template = await fetchTemplateById(templateId);
        if (isCancelled) {
          return;
        }

        setPreviewMessages(
          normalizeTemplateMessages(
            template.messages as TemplateMessageBlock[],
          ),
        );
      } catch (error) {
        if (!isCancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to load template preview",
          );
          setPreviewMessages([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingPreview(false);
        }
      }
    };

    loadPreview();

    return () => {
      isCancelled = true;
    };
  }, [templateId]);

  const previewMessagesToShow = templateId ? previewMessages : [];

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Broadcasts", href: "/broadcasts" },
    {
      label: isViewMode ? "View" : isEditMode ? "Edit" : "Create",
      isActive: true,
    },
  ];

  const validateForm = () => {
    if (!title.trim()) {
      toast.error("Broadcast title is required");
      return false;
    }

    if (!templateId) {
      toast.error("Please select a message template");
      return false;
    }

    if (sendMode === "schedule") {
      if (!scheduledFor) {
        toast.error("Please choose a schedule date and time");
        return false;
      }

      if (new Date(scheduledFor).getTime() <= Date.now()) {
        toast.error("Schedule time must be in the future");
        return false;
      }
    }

    if (previewMessagesToShow.length === 0) {
      toast.error("Selected template has no messages to send");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (isReadOnly || !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const status: "draft" | "scheduled" | "processing" =
        sendMode === "now"
          ? "processing"
          : sendMode === "schedule"
            ? "scheduled"
            : "draft";

      const payload = {
        name: title.trim(),
        description: description.trim() || undefined,
        templateId,
        audienceType,
        status,
        scheduledFor:
          sendMode === "schedule"
            ? new Date(scheduledFor).toISOString()
            : undefined,
      };

      if (isEditMode && broadcastId) {
        await updateBroadcast(broadcastId, {
          ...payload,
          scheduledFor:
            sendMode === "schedule" ? payload.scheduledFor : null,
        });
      } else {
        await createBroadcast(payload);
      }

      const successMessage =
        sendMode === "now"
          ? `"${title.trim()}" is being sent`
          : sendMode === "schedule"
            ? `"${title.trim()}" scheduled successfully`
            : `"${title.trim()}" saved as draft`;

      toast.success(successMessage);
      clearBroadcastListDataCache();
      router.push("/broadcasts");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save broadcast",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingOptions || isLoadingBroadcast) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading broadcast form...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
          {loadError}
        </div>
        <FormActionFooter mode="view" cancelHref="/broadcasts" />
      </div>
    );
  }

  const fieldClassName = isReadOnly ? readOnlyInputClassName : inputClassName;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {pageTitle}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {pageDescription}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Broadcast details
            </h2>
            <div className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Broadcast title *
                </label>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className={fieldClassName}
                  placeholder="Summer sale announcement"
                  readOnly={isReadOnly}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className={`${fieldClassName} resize-none`}
                  placeholder="Optional notes about this broadcast"
                  readOnly={isReadOnly}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
              Message template *
            </h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Choose a template to send in this broadcast
            </p>
            {templates.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
                No active templates found. Create a template first.
              </div>
            ) : (
              <select
                value={templateId}
                onChange={(event) => setTemplateId(event.target.value)}
                className={fieldClassName}
                disabled={isReadOnly}
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.category})
                  </option>
                ))}
              </select>
            )}
            {selectedTemplate && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Badge variant="secondary">{selectedTemplate.type}</Badge>
                <span>{selectedTemplate.messages.length} message block(s)</span>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
              Audience *
            </h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Select who should receive this broadcast
            </p>
            <div className="grid gap-3">
              {audiences.map((option) => (
                <label
                  key={option.value}
                  className={`flex gap-3 rounded-lg border p-4 transition-colors ${
                    isReadOnly ? "cursor-default" : "cursor-pointer"
                  } ${
                    audienceType === option.value
                      ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="audienceType"
                    value={option.value}
                    checked={audienceType === option.value}
                    onChange={() => setAudienceType(option.value)}
                    className="mt-1"
                    disabled={isReadOnly}
                  />
                  <span className="flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="block text-sm font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </span>
                      <Badge variant="outline">
                        {option.count.toLocaleString()} users
                      </Badge>
                    </span>
                    <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          {!isViewMode && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                Send options *
              </h2>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Send immediately, schedule for later, or save as draft
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                {SEND_MODE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors ${
                      sendMode === option.value
                        ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/20"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="sendMode"
                      value={option.value}
                      checked={sendMode === option.value}
                      onChange={() => setSendMode(option.value)}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </span>
                      <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>

              {sendMode === "schedule" && (
                <div className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Schedule date & time *
                  </label>
                  <Input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(event) => setScheduledFor(event.target.value)}
                    className={inputClassName}
                  />
                </div>
              )}
            </section>
          )}

          {isViewMode && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                Send options
              </h2>
              <dl className="space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-gray-500 dark:text-gray-400">Mode</dt>
                  <dd className="text-right font-medium text-gray-900 dark:text-white">
                    {
                      SEND_MODE_OPTIONS.find((item) => item.value === sendMode)
                        ?.label
                    }
                  </dd>
                </div>
                {sendMode === "schedule" && scheduledFor && (
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-gray-500 dark:text-gray-400">
                      Scheduled for
                    </dt>
                    <dd className="text-right font-medium text-gray-900 dark:text-white">
                      {new Date(scheduledFor).toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
              Broadcast summary
            </h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Review your settings before sending
            </p>
            <dl className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Audience</dt>
                <dd className="text-right font-medium text-gray-900 dark:text-white">
                  {selectedAudience?.label ?? "—"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Recipients</dt>
                <dd className="text-right font-medium text-gray-900 dark:text-white">
                  {selectedAudience?.count.toLocaleString() ?? "0"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Template</dt>
                <dd className="text-right font-medium text-gray-900 dark:text-white">
                  {selectedTemplate?.name ?? "—"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Send mode</dt>
                <dd className="text-right font-medium text-gray-900 dark:text-white">
                  {
                    SEND_MODE_OPTIONS.find((item) => item.value === sendMode)
                      ?.label
                  }
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
              LINE OA Preview
            </h2>
            <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
              See how messages will appear before sending
            </p>
            {isLoadingPreview ? (
              <div className="flex items-center justify-center py-16 text-gray-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading preview...
              </div>
            ) : (
              <LineOaPreview
                messages={previewMessagesToShow}
                templateName={selectedTemplate?.name ?? title}
              />
            )}
          </section>
        </div>
      </div>

      <FormActionFooter
        mode={isViewMode ? "view" : isEditMode ? "edit" : "create"}
        cancelHref="/broadcasts"
        onSave={handleSubmit}
        isSubmitting={isSubmitting}
        disabled={templates.length === 0}
        createSaveLabel={saveLabel}
        editSaveLabel={saveLabel}
        savingLabel={savingLabel}
      />
    </div>
  );
}
