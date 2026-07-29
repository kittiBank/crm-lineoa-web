"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { FormActionFooter } from "@/components/ui/form-footer";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/hooks/useToast";
import { fetchTemplates } from "@/features/templates/lib/api";
import { MessageTemplate } from "@/features/templates/types";
import {
  createAutoMessage,
  fetchAutoMessageById,
  updateAutoMessage,
} from "@/features/auto-message/lib/api";
import {
  AutoMessageMatchType,
  MATCH_TYPE_OPTIONS,
} from "@/features/auto-message/types";

const inputClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

interface AutoMessageBuilderProps {
  autoMessageId?: string;
  mode?: "create" | "edit" | "view";
}

export function AutoMessageBuilderContainer({
  autoMessageId,
  mode,
}: AutoMessageBuilderProps) {
  const router = useRouter();
  const toast = useToast();
  const resolvedMode = mode ?? (autoMessageId ? "edit" : "create");
  const isViewMode = resolvedMode === "view";
  const isEditMode = resolvedMode === "edit";

  const [name, setName] = useState("");
  const [keyword, setKeyword] = useState("");
  const [matchType, setMatchType] = useState<AutoMessageMatchType>("exact");
  const [templateId, setTemplateId] = useState("");
  const [priority, setPriority] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isLoading, setIsLoading] = useState(Boolean(autoMessageId));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === templateId) ?? null,
    [templates, templateId],
  );

  useEffect(() => {
    let isCancelled = false;

    const loadOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const templateList = await fetchTemplates();
        if (isCancelled) return;

        const activeTemplates = templateList.filter(
          (template) => template.isActive,
        );
        setTemplates(activeTemplates);

        if (!autoMessageId && activeTemplates.length > 0) {
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
  }, [autoMessageId]);

  useEffect(() => {
    if (!autoMessageId) return;

    let isCancelled = false;

    const loadAutoMessage = async () => {
      setIsLoading(true);
      try {
        const item = await fetchAutoMessageById(autoMessageId);
        if (isCancelled) return;

        setName(item.name);
        setKeyword(item.keyword);
        setMatchType(item.matchType);
        setTemplateId(item.templateId);
        setPriority(item.priority);
        setIsActive(item.isActive);
      } catch (error) {
        if (isCancelled) return;
        toast.error(
          error instanceof Error ? error.message : "Failed to load auto message",
        );
        router.push("/auto-message");
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadAutoMessage();

    return () => {
      isCancelled = true;
    };
  }, [autoMessageId]);

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Auto Message", href: "/auto-message" },
    {
      label: isViewMode ? "View" : isEditMode ? "Edit" : "Create",
      isActive: true,
    },
  ];

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Auto message name is required");
      return false;
    }
    if (!keyword.trim()) {
      toast.error("Keyword is required");
      return false;
    }
    if (!templateId) {
      toast.error("Template is required");
      return false;
    }
    if (priority < 1) {
      toast.error("Priority must be at least 1");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        keyword: keyword.trim(),
        matchType,
        templateId,
        priority,
        isActive,
      };

      if (isEditMode && autoMessageId) {
        await updateAutoMessage(autoMessageId, payload);
        toast.success(`"${name.trim()}" updated successfully`);
      } else {
        await createAutoMessage(payload);
        toast.success(`"${name.trim()}" created successfully`);
      }

      router.push("/auto-message");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save auto message",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isLoadingOptions) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading auto message...
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
              ? "View Auto Message"
              : isEditMode
                ? "Edit Auto Message"
                : "Create Auto Message"}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isViewMode
              ? "Review auto message rule configuration"
              : "Configure keyword-based auto reply rules"}
          </p>
        </div>
      </div>

      <div className="space-y-6 max-w-4xl">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Basic Information
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClassName}
                placeholder="e.g. Welcome Reply"
                readOnly={isViewMode}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={isActive ? "active" : "inactive"}
                onChange={(e) => setIsActive(e.target.value === "active")}
                className={inputClassName}
                disabled={isViewMode}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Priority *
              </label>
              <Input
                type="number"
                min={1}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className={inputClassName}
                readOnly={isViewMode}
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Lower number = higher priority when multiple rules match
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Keyword Rule
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Keyword *
              </label>
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className={inputClassName}
                placeholder="e.g. hello, promo"
                readOnly={isViewMode}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Match Type *
              </label>
              <select
                value={matchType}
                onChange={(e) =>
                  setMatchType(e.target.value as AutoMessageMatchType)
                }
                className={inputClassName}
                disabled={isViewMode}
              >
                {MATCH_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Message Template
          </h2>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Template *
            </label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className={inputClassName}
              disabled={isViewMode}
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            {selectedTemplate && (
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                {selectedTemplate.description || "No description"}
              </p>
            )}
            {templates.length === 0 && (
              <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                No active templates available. Create a template first.
              </p>
            )}
          </div>
        </section>
      </div>

      <FormActionFooter
        mode={isViewMode ? "view" : isEditMode ? "edit" : "create"}
        cancelHref="/auto-message"
        onSave={handleSubmit}
        isSubmitting={isSubmitting}
        disabled={templates.length === 0}
        createSaveLabel="Create Auto Message"
        editSaveLabel="Save Changes"
        savingLabel="Saving..."
      />
    </div>
  );
}
