import { API_ENDPOINTS } from "@/constants/api";
import { assertOkResponse, getAuthHeaders } from "@/lib/api-client";
import {
  AudienceImportJob,
  AudienceImportJobQuery,
  AudienceImportRow,
  AudienceImportRowQuery,
  PaginatedResponse,
} from "../types/audience-import";

export async function fetchAudienceImportJobs(
  query: AudienceImportJobQuery,
): Promise<PaginatedResponse<AudienceImportJob>> {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  });
  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  const response = await fetch(
    `${API_ENDPOINTS.AUDIENCE_IMPORTS.JOBS}?${params}`,
    { headers: getAuthHeaders(), cache: "no-store" },
  );

  await assertOkResponse(response, "Failed to fetch import history");

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

export async function fetchAudienceImportRows(
  id: string,
  query: AudienceImportRowQuery,
): Promise<PaginatedResponse<AudienceImportRow>> {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  });
  if (query.status) {
    params.set("status", query.status);
  }

  const response = await fetch(
    `${API_ENDPOINTS.AUDIENCE_IMPORTS.ROWS(id)}?${params}`,
    { headers: getAuthHeaders(), cache: "no-store" },
  );

  await assertOkResponse(response, "Failed to fetch import rows");

  return response.json();
}

/** "members.csv" -> "members-result.xlsx" (matches the API's file name). */
export function toResultFileName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "") || "audience-import";
  return `${base}-result.xlsx`;
}

/** Downloads the result .xlsx (every row with status and error note). */
export async function downloadAudienceImportResult(
  job: Pick<AudienceImportJob, "id" | "fileName">,
): Promise<void> {
  const response = await fetch(API_ENDPOINTS.AUDIENCE_IMPORTS.RESULT(job.id), {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await assertOkResponse(response, "Failed to download import result");

  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = toResultFileName(job.fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Deletes the import log only; tiers it applied are kept. */
export async function deleteAudienceImportJob(id: string): Promise<void> {
  const response = await fetch(API_ENDPOINTS.AUDIENCE_IMPORTS.JOB(id), {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await assertOkResponse(response, "Failed to delete import");
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
