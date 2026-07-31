import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import {
  Audience,
  AudienceCriteria,
  AudienceSegmentType,
  CreateAudiencePayload,
  UpdateAudiencePayload,
} from "../types";

/**
 * Client-side estimate for form preview.
 * List/detail responses use server-calculated `memberCount`.
 */
export function estimateMemberCount(
  type: AudienceSegmentType,
  criteria: AudienceCriteria,
): number {
  switch (type) {
    case "all":
      return 45200;
    case "user_type": {
      const selected = criteria.userTypes ?? [];
      let total = 0;
      if (selected.includes("Member")) total += 18200;
      if (selected.includes("Guest")) total += 22100;
      if (selected.includes("VIP")) total += 1450;
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
      };
    case "active":
      return { activityDays: criteria.activityDays };
    case "new":
      return { newFollowerDays: criteria.newFollowerDays };
    default:
      return {};
  }
}

let inflightAudiencesList: Promise<Audience[]> | null = null;
const inflightAudienceById = new Map<string, Promise<Audience>>();

export async function fetchAudiences(): Promise<Audience[]> {
  // Dedupe concurrent list calls (React Strict Mode remounts useEffect in dev)
  if (inflightAudiencesList) {
    return inflightAudiencesList;
  }

  inflightAudiencesList = (async () => {
    const response = await fetch(API_ENDPOINTS.AUDIENCES.LIST, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    await assertOkResponse(response, "Failed to fetch audiences");

    return response.json();
  })().finally(() => {
    inflightAudiencesList = null;
  });

  return inflightAudiencesList;
}

export async function fetchAudienceById(id: string): Promise<Audience> {
  // Dedupe concurrent detail calls (React Strict Mode remounts useEffect in dev)
  const existing = inflightAudienceById.get(id);
  if (existing) {
    return existing;
  }

  const request = (async () => {
    const response = await fetch(API_ENDPOINTS.AUDIENCES.DETAIL(id), {
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    await assertOkResponse(response, "Failed to fetch audience");

    return response.json();
  })().finally(() => {
    inflightAudienceById.delete(id);
  });

  inflightAudienceById.set(id, request);
  return request;
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

  return response.json();
}

export async function deleteAudience(id: string): Promise<void> {
  const response = await fetch(API_ENDPOINTS.AUDIENCES.DETAIL(id), {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await assertOkResponse(response, "Failed to delete audience");
}
