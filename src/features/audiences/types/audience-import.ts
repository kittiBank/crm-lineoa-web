/**
 * Audience import: tel no -> user tier mapping, uploaded as .xlsx/.csv.
 * Tiers are uppercase end to end (file, API, UI).
 */

export type ImportTier = "SILVER" | "GOLD" | "PLATINUM";

export const IMPORT_TIERS: ImportTier[] = ["SILVER", "GOLD", "PLATINUM"];

export interface ImportedAudienceLineUser {
  id: string;
  lineUserId: string;
  displayName: string | null;
  pictureUrl: string | null;
}

export interface ImportedAudienceRecord {
  id: string;
  phone: string;
  userTier: ImportTier;
  /** null until a LINE user verifies this phone via LIFF OTP. */
  lineUser: ImportedAudienceLineUser | null;
  sourceJobId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ImportedAudienceListResponse {
  data: ImportedAudienceRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ImportedAudienceQuery {
  page: number;
  limit: number;
  search?: string;
}

export type AudienceImportJobStatus =
  | "VALIDATING"
  | "VALIDATED"
  | "FAILED"
  | "IMPORTING"
  | "COMPLETED"
  | "CANCELLED";

/** Statuses the worker is still processing; the UI polls while in these. */
export const AUDIENCE_IMPORT_PENDING_STATUSES: AudienceImportJobStatus[] = [
  "VALIDATING",
  "IMPORTING",
];

export interface AudienceImportRowError {
  rowNumber: number;
  column: "telNo" | "userTier";
  value: string;
  code:
    | "MISSING_PHONE"
    | "INVALID_PHONE"
    | "DUPLICATE_PHONE"
    | "MISSING_TIER"
    | "INVALID_TIER";
  message: string;
}

export interface AudienceImportJob {
  id: string;
  fileName: string;
  status: AudienceImportJobStatus;
  totalRows: number;
  validRows: number;
  /** Rows with at least one error. Any error blocks the whole import. */
  errorRows: number;
  /** First 500 errors only. */
  errors: AudienceImportRowError[];
  /** File-level problem (missing columns, empty or unreadable file). */
  failureReason: string | null;
  canConfirm: boolean;
  createdAt: string;
  validatedAt: string | null;
  completedAt: string | null;
}
