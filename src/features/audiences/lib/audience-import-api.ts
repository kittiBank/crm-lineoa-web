import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import {
  AudienceImportJob,
  ImportTier,
  ImportedAudienceListResponse,
  ImportedAudienceQuery,
  ImportedAudienceRecord,
} from "../types/audience-import";

export async function fetchImportedAudiences(
  query: ImportedAudienceQuery,
): Promise<ImportedAudienceListResponse> {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  });
  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  const response = await fetch(
    `${API_ENDPOINTS.AUDIENCE_IMPORTS.RECORDS}?${params}`,
    { headers: getAuthHeaders(), cache: "no-store" },
  );

  await assertOkResponse(response, "Failed to fetch imported audiences");

  return response.json();
}

export async function fetchImportedAudience(
  id: string,
): Promise<ImportedAudienceRecord> {
  const response = await fetch(API_ENDPOINTS.AUDIENCE_IMPORTS.RECORD(id), {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await assertOkResponse(response, "Failed to fetch imported audience");

  return response.json();
}

export async function updateImportedAudienceTier(
  id: string,
  userTier: ImportTier,
): Promise<ImportedAudienceRecord> {
  const response = await fetch(API_ENDPOINTS.AUDIENCE_IMPORTS.RECORD(id), {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ userTier }),
  });

  await assertOkResponse(response, "Failed to update user tier");

  return response.json();
}

export async function deleteImportedAudience(id: string): Promise<void> {
  const response = await fetch(API_ENDPOINTS.AUDIENCE_IMPORTS.RECORD(id), {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await assertOkResponse(response, "Failed to delete imported audience");
}

/** Uploads the file and returns the job (status VALIDATING) to poll. */
export async function uploadAudienceImportFile(
  file: File,
): Promise<AudienceImportJob> {
  const formData = new FormData();
  formData.append("file", file);

  // Let the browser set the multipart boundary.
  const headers = getAuthHeaders();
  delete headers["Content-Type"];

  const response = await fetch(API_ENDPOINTS.AUDIENCE_IMPORTS.JOBS, {
    method: "POST",
    headers,
    body: formData,
  });

  await assertOkResponse(response, "Failed to upload import file");

  return response.json();
}

export async function fetchAudienceImportJob(
  id: string,
): Promise<AudienceImportJob> {
  const response = await fetch(API_ENDPOINTS.AUDIENCE_IMPORTS.JOB(id), {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await assertOkResponse(response, "Failed to fetch import status");

  return response.json();
}

export async function confirmAudienceImportJob(
  id: string,
): Promise<AudienceImportJob> {
  const response = await fetch(API_ENDPOINTS.AUDIENCE_IMPORTS.CONFIRM(id), {
    method: "POST",
    headers: getAuthHeaders(),
  });

  await assertOkResponse(response, "Failed to confirm import");

  return response.json();
}

export async function cancelAudienceImportJob(
  id: string,
): Promise<AudienceImportJob> {
  const response = await fetch(API_ENDPOINTS.AUDIENCE_IMPORTS.CANCEL(id), {
    method: "POST",
    headers: getAuthHeaders(),
  });

  await assertOkResponse(response, "Failed to cancel import");

  return response.json();
}
