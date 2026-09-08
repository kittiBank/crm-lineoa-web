import {
  AudienceCriteria,
  AudienceMatchMode,
  AudienceSegmentType,
  AudienceWritableType,
  CombinableAudienceRule,
  TargetingRule,
} from "../types";

export function resolveAudienceType(
  rules: TargetingRule[],
): AudienceWritableType {
  if (rules.length <= 1) {
    return rules[0] ?? "active";
  }
  return "combined";
}

export function inferRulesFromAudience(
  type: AudienceSegmentType,
  criteria: AudienceCriteria,
): TargetingRule[] {
  if (type === "combined") {
    const rules: CombinableAudienceRule[] = [];
    if ((criteria.userTypes ?? []).length > 0) {
      rules.push("user_type");
    }
    if (criteria.activityDays) {
      rules.push("active");
    }
    if (criteria.newFollowerDays) {
      rules.push("new");
    }
    return rules.length > 0 ? rules : ["active"];
  }

  if (type === "user_type" || type === "active" || type === "new") {
    return [type];
  }

  return ["active"];
}

export function inferMatchMode(criteria: AudienceCriteria): AudienceMatchMode {
  return criteria.match === "or" ? "or" : "and";
}

export function criteriaForRules(
  rules: TargetingRule[],
  current: AudienceCriteria,
): AudienceCriteria {
  if (rules.length === 0) {
    return {};
  }

  const next: AudienceCriteria = {};

  if (rules.includes("user_type")) {
    next.userTypes =
      (current.userTypes ?? []).length > 0 ? current.userTypes : ["Member"];
    next.userTiers = current.userTiers ?? [];
  }

  if (rules.includes("active")) {
    next.activityDays = current.activityDays ?? 30;
  }

  if (rules.includes("new")) {
    next.newFollowerDays = current.newFollowerDays ?? 14;
  }

  if (rules.length >= 2) {
    next.match = current.match === "or" ? "or" : "and";
  }

  return next;
}
