/**
 * Audience import: tel no -> user tier mapping, uploaded as .xlsx/.csv.
 * Tiers are uppercase end to end (file, API, UI).
 */

export type ImportTier = "SILVER" | "GOLD" | "PLATINUM";

export type AudienceImportJobStatus =
  | "VALIDATING"
  | "VALIDATED"
  | "FAILED"
  | "IMPORTING"
  | "COMPLETED"
  | "CANCELLED";

/** PASS = every row saved; FAILED = any row failed or the file was rejected. */
export type AudienceImportJobResult = "PASS" | "FAILED" | "PROCESSING";

export type AudienceImportRowStatus = "PASS" | "FAILED";

export interface AudienceImportJob {
  id: string;
  fileName: string;
  status: AudienceImportJobStatus;
  result: AudienceImportJobResult;
  totalRows: number;
  passRows: number;
  failedRows: number;
  /** File-level problem (missing columns, empty or unreadable file). */
  failureReason: string | null;
  /** False for imports made before row results were kept. */
  hasResult: boolean;
  createdAt: string;
  completedAt: string | null;
}

export interface AudienceImportRow {
  rowNumber: number;
  rawPhone: string;
  rawTier: string;
  /** Normalized values; set on PASS rows only. */
  phone: string | null;
  userTier: ImportTier | null;
  status: AudienceImportRowStatus;
  errorNote: string | null;
  /** The tier was applied to a LINE user who verified this tel no. */
  lineUserMatched: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AudienceImportJobQuery {
  page: number;
  limit: number;
  search?: string;
}

export interface AudienceImportRowQuery {
  page: number;
  limit: number;
  status?: AudienceImportRowStatus;
}
