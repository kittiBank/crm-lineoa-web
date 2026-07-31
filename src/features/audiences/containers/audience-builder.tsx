"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Users } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { FormActionFooter } from "@/components/ui/form-footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/lib/hooks/useToast";
import {
  createAudience,
  estimateMemberCount,
  fetchAudienceById,
  updateAudience,
} from "@/features/audiences/lib/api";
import {
  ACTIVITY_DAY_OPTIONS,
  AUDIENCE_SEGMENT_OPTIONS,
  AUDIENCE_TYPE_LABELS,
  AudienceCriteria,
  AudienceSegmentType,
  AudienceUserTypeFilter,
  NEW_FOLLOWER_DAY_OPTIONS,
  USER_TYPE_FILTER_OPTIONS,
} from "@/features/audiences/types";

const inputClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

const readOnlyInputClassName = `${inputClassName} cursor-not-allowed bg-gray-50 dark:bg-gray-800/80`;

interface AudienceBuilderProps {
  audienceId?: string;
  mode?: "create" | "edit" | "view";
}

function defaultCriteria(type: AudienceSegmentType): AudienceCriteria {
  switch (type) {
    case "user_type":
      return { userTypes: ["Member"] };
    case "active":
      return { activityDays: 30 };
    case "new":
      return { newFollowerDays: 14 };
    default:
      return {};
  }
}

export function AudienceBuilderContainer({
  audienceId,
  mode,
}: AudienceBuilderProps) {
  const router = useRouter();
  const toast = useToast();
  const resolvedMode = mode ?? (audienceId ? "edit" : "create");
  const isViewMode = resolvedMode === "view";
  const isEditMode = resolvedMode === "edit";
  const isReadOnly = isViewMode;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [segmentType, setSegmentType] = useState<AudienceSegmentType>("active");
  const [criteria, setCriteria] = useState<AudienceCriteria>(
    defaultCriteria("active"),
  );
  const [isActive, setIsActive] = useState(true);
  const [memberCount, setMemberCount] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(Boolean(audienceId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const fieldClassName = isReadOnly ? readOnlyInputClassName : inputClassName;

  const estimatedCount = useMemo(
    () => estimateMemberCount(segmentType, criteria),
    [segmentType, criteria],
  );

  const displayCount = isViewMode && memberCount !== null ? memberCount : estimatedCount;

  useEffect(() => {
    if (!audienceId) return;

    let isCancelled = false;

    const loadAudience = async () => {
      setIsLoading(true);
      try {
        const audience = await fetchAudienceById(audienceId);
        if (isCancelled) return;

        setName(audience.name);
        setDescription(audience.description ?? "");
        setSegmentType(audience.type);
        setCriteria(audience.criteria ?? defaultCriteria(audience.type));
        setIsActive(audience.isActive);
        setMemberCount(audience.memberCount);
      } catch (error) {
        if (isCancelled) return;
        toast.error(
          error instanceof Error ? error.message : "Failed to load audience",
        );
        router.push("/audiences");
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadAudience();

    return () => {
      isCancelled = true;
    };
  }, [audienceId]);

  const handleSegmentTypeChange = (type: AudienceSegmentType) => {
    if (isReadOnly) return;
    const option = AUDIENCE_SEGMENT_OPTIONS.find((item) => item.value === type);
    if (option?.comingSoon) {
      toast.info("Custom segments will be available later");
      return;
    }
    setSegmentType(type);
    setCriteria(defaultCriteria(type));
  };

  const toggleUserType = (userType: AudienceUserTypeFilter) => {
    if (isReadOnly) return;
    const option = USER_TYPE_FILTER_OPTIONS.find(
      (item) => item.value === userType,
    );
    if (option?.comingSoon) {
      toast.info("VIP levels will be configurable later");
      return;
    }

    const current = criteria.userTypes ?? [];
    const next = current.includes(userType)
      ? current.filter((item) => item !== userType)
      : [...current, userType];

    setCriteria({ ...criteria, userTypes: next });
  };

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Audience name is required");
      return false;
    }
    if (segmentType === "user_type") {
      const selected = (criteria.userTypes ?? []).filter(
        (item) => item !== "VIP",
      );
      if (selected.length === 0) {
        toast.error("Select at least one user type");
        return false;
      }
    }
    if (segmentType === "active" && !criteria.activityDays) {
      toast.error("Select an activity window");
      return false;
    }
    if (segmentType === "new" && !criteria.newFollowerDays) {
      toast.error("Select a new follower window");
      return false;
    }
    if (segmentType === "segment") {
      toast.error("Custom segments are not available yet");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim()
          ? description.trim()
          : isEditMode
            ? null
            : undefined,
        type: segmentType,
        criteria,
        isActive,
      };

      if (isEditMode && audienceId) {
        await updateAudience(audienceId, payload);
        toast.success(`"${name.trim()}" updated successfully`);
      } else {
        await createAudience({
          name: payload.name,
          description: payload.description ?? undefined,
          type: payload.type,
          criteria: payload.criteria,
          isActive: payload.isActive,
        });
        toast.success(`"${name.trim()}" created successfully`);
      }

      router.push("/audiences");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save audience",
      );
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Audience Management", href: "/audiences" },
    {
      label: isViewMode ? "View" : isEditMode ? "Edit" : "Create",
      isActive: true,
    },
  ];

  const pageTitle = isViewMode
    ? "View Audience"
    : isEditMode
      ? "Edit Audience"
      : "Create New Audience";

  const pageDescription = isViewMode
    ? "Review audience segment rules and estimated reach"
    : isEditMode
      ? "Update targeting rules for this audience group"
      : "Create a target audience group from LINE users, such as Member, Guest, or Active users";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading audience...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {pageTitle}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {pageDescription}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6 max-w-4xl">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Audience name *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={fieldClassName}
                  placeholder="e.g. Active Members (30 days)"
                  readOnly={isReadOnly}
                  disabled={isReadOnly}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${fieldClassName} resize-none`}
                  placeholder="Optional notes about this audience group"
                  readOnly={isReadOnly}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  value={isActive ? "active" : "inactive"}
                  onChange={(e) => setIsActive(e.target.value === "active")}
                  className={fieldClassName}
                  disabled={isReadOnly}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
              Targeting rules *
            </h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Choose how this audience group is built from LINE users
            </p>

            <div className="grid gap-3">
              {AUDIENCE_SEGMENT_OPTIONS.map((option) => {
                const isSelected = segmentType === option.value;
                const isDisabled = Boolean(option.comingSoon) || isReadOnly;

                return (
                  <label
                    key={option.value}
                    className={`flex gap-3 rounded-lg border p-4 transition-colors ${
                      isDisabled && !isSelected
                        ? "cursor-not-allowed opacity-60"
                        : isReadOnly
                          ? "cursor-default"
                          : "cursor-pointer"
                    } ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/20"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="segmentType"
                      value={option.value}
                      checked={isSelected}
                      onChange={() => handleSegmentTypeChange(option.value)}
                      className="mt-1"
                      disabled={isDisabled && !isSelected}
                    />
                    <span className="flex-1">
                      <span className="flex items-center gap-2">
                        <span className="block text-sm font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </span>
                        {option.comingSoon && (
                          <Badge variant="secondary">Coming soon</Badge>
                        )}
                      </span>
                      <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>

            {segmentType === "user_type" && (
              <div className="mt-5 space-y-3 border-t border-gray-200 pt-5 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  User types *
                </p>
                <div className="grid gap-3 md:grid-cols-3">
                  {USER_TYPE_FILTER_OPTIONS.map((option) => {
                    const checked =
                      criteria.userTypes?.includes(option.value) ?? false;
                    const disabled =
                      Boolean(option.comingSoon) || isReadOnly;

                    return (
                      <label
                        key={option.value}
                        className={`rounded-lg border p-4 transition-colors ${
                          disabled && !checked
                            ? "cursor-not-allowed opacity-60"
                            : isReadOnly
                              ? "cursor-default"
                              : "cursor-pointer"
                        } ${
                          checked
                            ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/20"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <span className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleUserType(option.value)}
                            className="mt-1"
                            disabled={disabled && !checked}
                          />
                          <span>
                            <span className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {option.label}
                              </span>
                              {option.comingSoon && (
                                <Badge variant="secondary">Coming soon</Badge>
                              )}
                            </span>
                            <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                              {option.description}
                            </span>
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {segmentType === "active" && (
              <div className="mt-5 space-y-3 border-t border-gray-200 pt-5 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Active within *
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {ACTIVITY_DAY_OPTIONS.map((days) => {
                    const checked = criteria.activityDays === days;
                    return (
                      <label
                        key={days}
                        className={`rounded-lg border p-4 text-center transition-colors ${
                          isReadOnly ? "cursor-default" : "cursor-pointer"
                        } ${
                          checked
                            ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/20"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="activityDays"
                          className="sr-only"
                          checked={checked}
                          onChange={() =>
                            setCriteria({ ...criteria, activityDays: days })
                          }
                          disabled={isReadOnly}
                        />
                        <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                          Last {days} days
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {segmentType === "new" && (
              <div className="mt-5 space-y-3 border-t border-gray-200 pt-5 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Followed within *
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {NEW_FOLLOWER_DAY_OPTIONS.map((days) => {
                    const checked = criteria.newFollowerDays === days;
                    return (
                      <label
                        key={days}
                        className={`rounded-lg border p-4 text-center transition-colors ${
                          isReadOnly ? "cursor-default" : "cursor-pointer"
                        } ${
                          checked
                            ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/20"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="newFollowerDays"
                          className="sr-only"
                          checked={checked}
                          onChange={() =>
                            setCriteria({
                              ...criteria,
                              newFollowerDays: days,
                            })
                          }
                          disabled={isReadOnly}
                        />
                        <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                          Last {days} days
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
              Audience summary
            </h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Estimated reach based on current rules
            </p>

            <div className="mb-4 flex items-center gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Estimated members
                </p>
                <p
                  className="text-xl font-bold text-gray-900 dark:text-white"
                  suppressHydrationWarning
                >
                  {displayCount.toLocaleString()}
                </p>
              </div>
            </div>

            <dl className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Type</dt>
                <dd className="text-right font-medium text-gray-900 dark:text-white">
                  {AUDIENCE_TYPE_LABELS[segmentType]}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Status</dt>
                <dd className="text-right font-medium text-gray-900 dark:text-white">
                  {isActive ? "Active" : "Inactive"}
                </dd>
              </div>
              {segmentType === "user_type" && (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-gray-500 dark:text-gray-400">
                    User types
                  </dt>
                  <dd className="text-right font-medium text-gray-900 dark:text-white">
                    {(criteria.userTypes ?? []).length > 0
                      ? (criteria.userTypes ?? []).join(", ")
                      : "—"}
                  </dd>
                </div>
              )}
              {segmentType === "active" && (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-gray-500 dark:text-gray-400">
                    Activity window
                  </dt>
                  <dd className="text-right font-medium text-gray-900 dark:text-white">
                    Last {criteria.activityDays ?? "—"} days
                  </dd>
                </div>
              )}
              {segmentType === "new" && (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-gray-500 dark:text-gray-400">
                    Follow window
                  </dt>
                  <dd className="text-right font-medium text-gray-900 dark:text-white">
                    Last {criteria.newFollowerDays ?? "—"} days
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      </div>

      <FormActionFooter
        mode={isViewMode ? "view" : isEditMode ? "edit" : "create"}
        cancelHref="/audiences"
        onSave={handleSubmit}
        isSubmitting={isSubmitting}
        createSaveLabel="Create Audience"
        editSaveLabel="Save Changes"
        savingLabel="Saving..."
      />
    </div>
  );
}
