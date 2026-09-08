"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Users } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { FormActionFooter } from "@/components/ui/form-footer";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/hooks/useToast";
import {
  createAudience,
  estimateMemberCount,
  fetchAudienceById,
  fetchAudienceEstimate,
  updateAudience,
} from "@/features/audiences/lib/api";
import {
  criteriaForRules,
  inferMatchMode,
  inferRulesFromAudience,
  resolveAudienceType,
} from "@/features/audiences/lib/targeting";
import {
  ACTIVITY_DAY_OPTIONS,
  AUDIENCE_MATCH_MODE_LABELS,
  AUDIENCE_SEGMENT_OPTIONS,
  AUDIENCE_TYPE_LABELS,
  AudienceCriteria,
  AudienceMatchMode,
  AudienceUserTierFilter,
  AudienceUserTypeFilter,
  NEW_FOLLOWER_DAY_OPTIONS,
  TargetingRule,
  USER_TIER_FILTER_OPTIONS,
  USER_TYPE_FILTER_OPTIONS,
} from "@/features/audiences/types";

const inputClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

const readOnlyInputClassName = `${inputClassName} cursor-not-allowed bg-gray-50 dark:bg-gray-800/80`;

const errorInputClassName =
  "border-red-500 focus:ring-red-500 dark:border-red-500";

type AudienceFormErrors = {
  name?: string;
  targetingRules?: string;
  userTypes?: string;
  activityDays?: string;
  newFollowerDays?: string;
};

function RequiredMark() {
  return <span className="text-red-500">*</span>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{message}</p>
  );
}

function optionCardClass({
  isReadOnly,
  isSelected,
  hasError,
}: {
  isReadOnly: boolean;
  isSelected: boolean;
  hasError?: boolean;
}) {
  const cursor = isReadOnly ? "cursor-default" : "cursor-pointer";
  if (isSelected) {
    return `${cursor} border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/20`;
  }
  if (hasError) {
    return `${cursor} border-red-500 dark:border-red-500`;
  }
  return `${cursor} border-gray-200 dark:border-gray-700`;
}

interface AudienceBuilderProps {
  audienceId?: string;
  mode?: "create" | "edit" | "view";
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
  const [selectedRules, setSelectedRules] = useState<TargetingRule[]>([
    "active",
  ]);
  const [matchMode, setMatchMode] = useState<AudienceMatchMode>("and");
  const [criteria, setCriteria] = useState<AudienceCriteria>(
    criteriaForRules(["active"], {}),
  );
  const [isActive, setIsActive] = useState(true);
  const [memberCount, setMemberCount] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(Boolean(audienceId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveEstimateCount, setLiveEstimateCount] = useState<number | null>(
    null,
  );
  const [isEstimatingMembers, setIsEstimatingMembers] = useState(false);
  const [errors, setErrors] = useState<AudienceFormErrors>({});
  const isSubmittingRef = useRef(false);

  const fieldClassName = isReadOnly ? readOnlyInputClassName : inputClassName;
  const segmentType = resolveAudienceType(selectedRules);
  const includesUserType = selectedRules.includes("user_type");
  const includesActive = selectedRules.includes("active");
  const includesNew = selectedRules.includes("new");
  const showMatchMode = selectedRules.length >= 2;
  const resolvedCriteria = useMemo(
    () => ({
      ...criteria,
      ...(showMatchMode ? { match: matchMode } : {}),
    }),
    [criteria, matchMode, showMatchMode],
  );

  const estimatedCount = useMemo(
    () => estimateMemberCount(segmentType, resolvedCriteria),
    [segmentType, resolvedCriteria],
  );

  const usesLiveEstimate =
    selectedRules.length > 0 &&
    (segmentType === "user_type" ||
      segmentType === "active" ||
      segmentType === "new" ||
      segmentType === "combined");

  const displayCount =
    isViewMode && memberCount !== null
      ? memberCount
      : selectedRules.length === 0
        ? 0
        : usesLiveEstimate
          ? (liveEstimateCount ?? 0)
          : estimatedCount;

  useEffect(() => {
    if (!audienceId) return;

    let isCancelled = false;

    const loadAudience = async () => {
      setIsLoading(true);
      try {
        const audience = await fetchAudienceById(audienceId);
        if (isCancelled) return;

        const rules = inferRulesFromAudience(
          audience.type,
          audience.criteria ?? {},
        );
        setName(audience.name);
        setDescription(audience.description ?? "");
        setSelectedRules(rules);
        setMatchMode(inferMatchMode(audience.criteria ?? {}));
        setCriteria(audience.criteria ?? criteriaForRules(rules, {}));
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

  useEffect(() => {
    const canEstimate = !isViewMode && usesLiveEstimate;

    if (!canEstimate) {
      setIsEstimatingMembers(false);
      if (selectedRules.length === 0) {
        setLiveEstimateCount(0);
      }
      return;
    }

    if (includesUserType && (criteria.userTypes ?? []).length === 0) {
      setLiveEstimateCount(0);
      setIsEstimatingMembers(false);
      return;
    }

    let isCancelled = false;

    const loadEstimate = async () => {
      setIsEstimatingMembers(true);
      try {
        const estimate = await fetchAudienceEstimate(
          segmentType,
          resolvedCriteria,
        );
        if (isCancelled) return;
        setLiveEstimateCount(estimate.memberCount);
      } catch (error) {
        if (isCancelled) return;
        setLiveEstimateCount(0);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to estimate audience members",
        );
      } finally {
        if (!isCancelled) {
          setIsEstimatingMembers(false);
        }
      }
    };

    loadEstimate();

    return () => {
      isCancelled = true;
    };
  }, [
    isViewMode,
    usesLiveEstimate,
    selectedRules.length,
    segmentType,
    includesUserType,
    matchMode,
    criteria.userTypes,
    criteria.userTiers,
    criteria.activityDays,
    criteria.newFollowerDays,
  ]);

  const applyRules = (rules: TargetingRule[]) => {
    setSelectedRules(rules);
    setCriteria(criteriaForRules(rules, { ...criteria, match: matchMode }));
    setErrors((prev) => ({
      ...prev,
      targetingRules: rules.length > 0 ? undefined : prev.targetingRules,
      userTypes: rules.includes("user_type") ? prev.userTypes : undefined,
      activityDays: rules.includes("active") ? prev.activityDays : undefined,
      newFollowerDays: rules.includes("new") ? prev.newFollowerDays : undefined,
    }));
  };

  const handleToggleRule = (rule: TargetingRule) => {
    if (isReadOnly) return;

    const nextRules = selectedRules.includes(rule)
      ? selectedRules.filter((item) => item !== rule)
      : [...selectedRules, rule];

    applyRules(nextRules);
  };

  const handleMatchModeChange = (next: AudienceMatchMode) => {
    if (isReadOnly) return;
    setMatchMode(next);
    setCriteria({ ...criteria, match: next });
  };

  const toggleUserType = (userType: AudienceUserTypeFilter) => {
    if (isReadOnly) return;

    const current = criteria.userTypes ?? [];
    const next = current.includes(userType)
      ? current.filter((item) => item !== userType)
      : [...current, userType];

    setCriteria({ ...criteria, userTypes: next });
    setErrors((prev) => ({
      ...prev,
      userTypes:
        next.length === 0 ? "Select at least one user type" : undefined,
    }));
  };

  const toggleUserTier = (userTier: AudienceUserTierFilter) => {
    if (isReadOnly) return;

    const current = criteria.userTiers ?? [];
    const next = current.includes(userTier)
      ? current.filter((item) => item !== userTier)
      : [...current, userTier];

    setCriteria({ ...criteria, userTiers: next });
  };

  const validateForm = () => {
    const nextErrors: AudienceFormErrors = {};

    if (!name.trim()) {
      nextErrors.name = "Audience name is required";
    }
    if (selectedRules.length === 0) {
      nextErrors.targetingRules = "Select at least one targeting rule";
    }
    if (includesUserType && (criteria.userTypes ?? []).length === 0) {
      nextErrors.userTypes = "Select at least one user type";
    }
    if (includesActive && !criteria.activityDays) {
      nextErrors.activityDays = "Select an activity window";
    }
    if (includesNew && !criteria.newFollowerDays) {
      nextErrors.newFollowerDays = "Select a new follower window";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
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
        criteria: resolvedCriteria,
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
                  Audience name <RequiredMark />
                </label>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) {
                      setErrors((prev) => ({ ...prev, name: undefined }));
                    }
                  }}
                  className={`${fieldClassName} ${errors.name ? errorInputClassName : ""}`}
                  placeholder="e.g. Active Members (30 days)"
                  readOnly={isReadOnly}
                  disabled={isReadOnly}
                  aria-invalid={Boolean(errors.name)}
                />
                <FieldError message={errors.name} />
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
              Targeting rules <RequiredMark />
            </h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Combine User Type, Active Users, and New Followers with AND or OR.
              Targeting every follower is available when sending a broadcast.
            </p>

            <div className="grid gap-3">
              {AUDIENCE_SEGMENT_OPTIONS.map((option) => {
                const isSelected = selectedRules.includes(option.value);

                return (
                  <label
                    key={option.value}
                    className={`flex gap-3 rounded-lg border p-4 transition-colors ${optionCardClass(
                      {
                        isReadOnly,
                        isSelected,
                        hasError: Boolean(errors.targetingRules),
                      },
                    )}`}
                  >
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={isSelected}
                      onChange={() => handleToggleRule(option.value)}
                      className="mt-1"
                      disabled={isReadOnly}
                    />
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </span>
                      <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            <FieldError message={errors.targetingRules} />

            {showMatchMode && (
              <div className="mt-5 space-y-3 border-t border-gray-200 pt-5 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Match mode <RequiredMark />
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {matchMode === "and"
                    ? "Users must match every selected rule, e.g. Silver AND active in the last 7 days."
                    : "Users matching any selected rule are included."}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["and", "or"] as const).map((mode) => {
                    const checked = matchMode === mode;
                    return (
                      <label
                        key={mode}
                        className={`rounded-lg border p-4 transition-colors ${
                          isReadOnly ? "cursor-default" : "cursor-pointer"
                        } ${
                          checked
                            ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/20"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <span className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="matchMode"
                            checked={checked}
                            onChange={() => handleMatchModeChange(mode)}
                            className="mt-1"
                            disabled={isReadOnly}
                          />
                          <span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {mode === "and"
                                ? "Match all (AND)"
                                : "Match any (OR)"}
                            </span>
                            <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                              {mode === "and"
                                ? "Intersection of selected rules"
                                : "Union of selected rules"}
                            </span>
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {includesUserType && (
              <>
                <div className="mt-5 space-y-3 border-t border-gray-200 pt-5 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    User types <RequiredMark />
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {USER_TYPE_FILTER_OPTIONS.map((option) => {
                      const checked =
                        criteria.userTypes?.includes(option.value) ?? false;

                      return (
                        <label
                          key={option.value}
                          className={`rounded-lg border p-4 transition-colors ${optionCardClass(
                            {
                              isReadOnly,
                              isSelected: checked,
                              hasError: Boolean(errors.userTypes),
                            },
                          )}`}
                        >
                          <span className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleUserType(option.value)}
                              className="mt-1"
                              disabled={isReadOnly}
                            />
                            <span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {option.label}
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
                  <FieldError message={errors.userTypes} />
                </div>

                <div className="mt-5 space-y-3 border-t border-gray-200 pt-5 dark:border-gray-700">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      User tiers
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Optional. Leave unselected to include all tiers.
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    {USER_TIER_FILTER_OPTIONS.map((option) => {
                      const checked =
                        criteria.userTiers?.includes(option.value) ?? false;

                      return (
                        <label
                          key={option.value}
                          className={`rounded-lg border p-4 transition-colors ${
                            isReadOnly ? "cursor-default" : "cursor-pointer"
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
                              onChange={() => toggleUserTier(option.value)}
                              className="mt-1"
                              disabled={isReadOnly}
                            />
                            <span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {option.label}
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
              </>
            )}

            {includesActive && (
              <div className="mt-5 space-y-3 border-t border-gray-200 pt-5 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Active within <RequiredMark />
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {ACTIVITY_DAY_OPTIONS.map((days) => {
                    const checked = criteria.activityDays === days;
                    return (
                      <label
                        key={days}
                        className={`rounded-lg border p-4 text-center transition-colors ${optionCardClass(
                          {
                            isReadOnly,
                            isSelected: checked,
                            hasError: Boolean(errors.activityDays),
                          },
                        )}`}
                      >
                        <input
                          type="radio"
                          name="activityDays"
                          className="sr-only"
                          checked={checked}
                          onChange={() => {
                            setCriteria({ ...criteria, activityDays: days });
                            setErrors((prev) => ({
                              ...prev,
                              activityDays: undefined,
                            }));
                          }}
                          disabled={isReadOnly}
                        />
                        <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                          Last {days} days
                        </span>
                      </label>
                    );
                  })}
                </div>
                <FieldError message={errors.activityDays} />
              </div>
            )}

            {includesNew && (
              <div className="mt-5 space-y-3 border-t border-gray-200 pt-5 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Followed within <RequiredMark />
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {NEW_FOLLOWER_DAY_OPTIONS.map((days) => {
                    const checked = criteria.newFollowerDays === days;
                    return (
                      <label
                        key={days}
                        className={`rounded-lg border p-4 text-center transition-colors ${optionCardClass(
                          {
                            isReadOnly,
                            isSelected: checked,
                            hasError: Boolean(errors.newFollowerDays),
                          },
                        )}`}
                      >
                        <input
                          type="radio"
                          name="newFollowerDays"
                          className="sr-only"
                          checked={checked}
                          onChange={() => {
                            setCriteria({
                              ...criteria,
                              newFollowerDays: days,
                            });
                            setErrors((prev) => ({
                              ...prev,
                              newFollowerDays: undefined,
                            }));
                          }}
                          disabled={isReadOnly}
                        />
                        <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                          Last {days} days
                        </span>
                      </label>
                    );
                  })}
                </div>
                <FieldError message={errors.newFollowerDays} />
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
                {isEstimatingMembers && usesLiveEstimate ? (
                  <p className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    —
                  </p>
                ) : (
                  <p
                    className="text-xl font-bold text-gray-900 dark:text-white"
                    suppressHydrationWarning
                  >
                    {displayCount.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <dl className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Type</dt>
                <dd className="text-right font-medium text-gray-900 dark:text-white">
                  {selectedRules.length === 0
                    ? "—"
                    : AUDIENCE_TYPE_LABELS[segmentType]}
                </dd>
              </div>
              {showMatchMode && (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-gray-500 dark:text-gray-400">Match</dt>
                  <dd className="text-right font-medium text-gray-900 dark:text-white">
                    {AUDIENCE_MATCH_MODE_LABELS[matchMode]}
                  </dd>
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Status</dt>
                <dd className="text-right font-medium text-gray-900 dark:text-white">
                  {isActive ? "Active" : "Inactive"}
                </dd>
              </div>
              {includesUserType && (
                <>
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
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-gray-500 dark:text-gray-400">
                      User tiers
                    </dt>
                    <dd className="text-right font-medium text-gray-900 dark:text-white">
                      {(criteria.userTiers ?? []).length > 0
                        ? (criteria.userTiers ?? []).join(", ")
                        : "All"}
                    </dd>
                  </div>
                </>
              )}
              {includesActive && (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-gray-500 dark:text-gray-400">
                    Activity window
                  </dt>
                  <dd className="text-right font-medium text-gray-900 dark:text-white">
                    Last {criteria.activityDays ?? "—"} days
                  </dd>
                </div>
              )}
              {includesNew && (
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
