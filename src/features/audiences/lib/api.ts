import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import {
  dedupeAsync,
  invalidateDedupe,
  REMOUNT_DEDUPE_TTL_MS,
} from "@/lib/dedupe-async";
import {
  Audience,
  AudienceCriteria,
  AudienceEstimate,
  AudienceSegmentType,
  CreateAudiencePayload,
  UpdateAudiencePayload,
} from "../types";
import { isUserTier } from "@/constants/user-tier";

/**
 * Client-side estimate for form preview.
 * Type `all` uses `fetchAudienceEstimate` (LINE Insight) instead.
 */
export function estimateMemberCount(
  type: AudienceSegmentType,
  criteria: AudienceCriteria,
): number {
  switch (type) {
    case "all":
      return 0;
    case "user_type": {
      const selected = criteria.userTypes ?? [];
      let total = 0;
      if (selected.includes("Member")) total += 18200;
      if (selected.includes("Guest")) total += 22100;
      return total || 0;
    }
    case "active": {
      const days = criteria.activityDays ?? 30;
      if (days <= 7) return 6200;
      if (days <= 14) return 9800;
      if (days <= 30) return 12580;
      return 18900;
    }
    case "new": {
      const days = criteria.newFollowerDays ?? 14;
      if (days <= 7) return 840;
      if (days <= 14) return 1620;
      return 3100;
    }
    case "segment":
      return 0;
    default:
      return 0;
  }
}

/** Keep only criteria fields relevant to the selected segment type */
export function buildAudienceCriteria(
  type: AudienceSegmentType,
  criteria: AudienceCriteria,
): AudienceCriteria {
  switch (type) {
    case "user_type":
      return {
        userTypes: (criteria.userTypes ?? []).filter(
          (item) => item === "Member" || item === "Guest",
        ),
        userTiers: (criteria.userTiers ?? []).filter(isUserTier),
      };
    case "active":
      return { activityDays: criteria.activityDays };
    case "new":
      return { newFollowerDays: criteria.newFollowerDays };
    default:
      return {};
  }
}

export async function fetchAudienceEstimate(
  type: AudienceSegmentType,
  criteria?: AudienceCriteria,
): Promise<AudienceEstimate> {
  const params = new URLSearchParams({ type });

  if (type === "user_type") {
    for (const userType of criteria?.userTypes ?? []) {
      params.append("userTypes", userType);
    }
    for (const userTier of criteria?.userTiers ?? []) {
      params.append("userTiers", userTier);
    }
  }

  if (type === "active" && criteria?.activityDays) {
    params.set("activityDays", String(criteria.activityDays));
  }

  if (type === "new" && criteria?.newFollowerDays) {
    params.set("newFollowerDays", String(criteria.newFollowerDays));
  }

  return dedupeAsync(
    `audiences:estimate:${params.toString()}`,
    async () => {
      const response = await fetch(
        `${API_ENDPOINTS.AUDIENCES.ESTIMATE}?${params.toString()}`,
        {
          headers: getAuthHeaders(),
          cache: "no-store",
        },
      );

      await assertOkResponse(response, "Failed to estimate audience members");

      const payload = (await response.json()) as {
        success?: boolean;
        data?: AudienceEstimate;
      };

      if (!payload.success || !payload.data) {
        throw new Error("Failed to estimate audience members");
      }

      return payload.data;
    },
    { ttlMs: REMOUNT_DEDUPE_TTL_MS },
  );
}

export async function fetchAudiences(options?: {
  force?: boolean;
}): Promise<Audience[]> {
  return dedupeAsync(
    "audiences:list",
    async () => {
      const response = await fetch(API_ENDPOINTS.AUDIENCES.LIST, {
        headers: getAuthHeaders(),
        cache: "no-store",
      });

      await assertOkResponse(response, "Failed to fetch audiences");

      return response.json();
    },
    { ttlMs: REMOUNT_DEDUPE_TTL_MS, force: options?.force },
  );
}

export async function fetchAudienceById(id: string): Promise<Audience> {
  return dedupeAsync(
    `audiences:${id}`,
    async () => {
      const response = await fetch(API_ENDPOINTS.AUDIENCES.DETAIL(id), {
        headers: getAuthHeaders(),
        cache: "no-store",
      });

      await assertOkResponse(response, "Failed to fetch audience");

      return response.json();
    },
    { ttlMs: REMOUNT_DEDUPE_TTL_MS },
  );
}

export async function createAudience(
  payload: CreateAudiencePayload,
): Promise<Audience> {
  const response = await fetch(API_ENDPOINTS.AUDIENCES.CREATE, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      ...payload,
      criteria: buildAudienceCriteria(payload.type, payload.criteria),
    }),
  });

  await assertOkResponse(response, "Failed to create audience");

  invalidateDedupe("audiences:list");
  return response.json();
}

export async function updateAudience(
  id: string,
  payload: UpdateAudiencePayload,
): Promise<Audience> {
  const body: UpdateAudiencePayload =
    payload.type !== undefined && payload.criteria !== undefined
      ? {
        ...payload,
        criteria: buildAudienceCriteria(payload.type, payload.criteria),
      }
      : payload;

  const response = await fetch(API_ENDPOINTS.AUDIENCES.DETAIL(id), {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  await assertOkResponse(response, "Failed to update audience");

  invalidateDedupe("audiences:list");
  invalidateDedupe(`audiences:${id}`);
  return response.json();
}

export async function deleteAudience(id: string): Promise<void> {
  const response = await fetch(API_ENDPOINTS.AUDIENCES.DETAIL(id), {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await assertOkResponse(response, "Failed to delete audience");
  invalidateDedupe("audiences:list");
  invalidateDedupe(`audiences:${id}`);
}
