import * as XLSX from "xlsx";
import { UserTier, isUserTier } from "@/constants/user-tier";

export const USER_TIER_IMPORT_TEMPLATE_FILENAME = "line-user-tier-import.xlsx";
export const USER_TIER_IMPORT_MAX_BYTES = 5 * 1024 * 1024;
export const USER_TIER_IMPORT_MAX_ROWS = 5000;
export const USER_TIER_IMPORT_ACCEPT =
  ".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv";

export type UserTierImportStatus =
  | "ready"
  | "invalid_tier"
  | "missing_line_user_id";

export interface UserTierImportRow {
  rowNumber: number;
  lineUserId: string;
  userTier: string;
  parsedTier: UserTier | null;
  status: UserTierImportStatus;
}

export interface UserTierImportResult {
  fileName: string;
  rows: UserTierImportRow[];
  readyCount: number;
  errorCount: number;
}

const LINE_USER_ID_HEADERS = new Set([
  "lineuserid",
  "userid",
  "lineid",
  "lineuser",
]);

const USER_TIER_HEADERS = new Set(["usertier", "tier"]);

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function cellString(value: unknown): string {
  if (value == null) {
    return "";
  }

  return String(value).trim();
}

function findColumn(
  headers: string[],
  aliases: Set<string>,
): string | undefined {
  return headers.find((header) => aliases.has(normalizeHeader(header)));
}

function toImportStatus(
  lineUserId: string,
  parsedTier: UserTier | null,
): UserTierImportStatus {
  if (!lineUserId) {
    return "missing_line_user_id";
  }

  if (!parsedTier) {
    return "invalid_tier";
  }

  return "ready";
}

export function getUserTierImportTemplateWorkbook(): XLSX.WorkBook {
  const sheet = XLSX.utils.aoa_to_sheet([
    ["lineUserId", "userTier"],
    ["U1234567890abcdef", "Gold"],
    ["U0987654321fedcba", "Silver"],
  ]);
  sheet["!cols"] = [{ wch: 28 }, { wch: 14 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "User Tiers");
  return workbook;
}

export function downloadUserTierImportTemplate() {
  XLSX.writeFile(
    getUserTierImportTemplateWorkbook(),
    USER_TIER_IMPORT_TEMPLATE_FILENAME,
  );
}

export async function parseUserTierImportFile(
  file: File,
): Promise<UserTierImportResult> {
  if (file.size > USER_TIER_IMPORT_MAX_BYTES) {
    throw new Error("File is larger than 5 MB");
  }

  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("The spreadsheet does not contain any sheets");
  }

  const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    workbook.Sheets[sheetName],
    { defval: "", raw: false },
  );

  if (records.length === 0) {
    throw new Error("No data rows found. Use lineUserId and userTier columns.");
  }

  if (records.length > USER_TIER_IMPORT_MAX_ROWS) {
    throw new Error(
      `File has more than ${USER_TIER_IMPORT_MAX_ROWS.toLocaleString()} rows`,
    );
  }

  const headers = Object.keys(records[0] ?? {});
  const lineUserIdKey = findColumn(headers, LINE_USER_ID_HEADERS);
  const userTierKey = findColumn(headers, USER_TIER_HEADERS);

  if (!lineUserIdKey || !userTierKey) {
    throw new Error(
      "Could not find lineUserId and userTier columns. Download the template and try again.",
    );
  }

  const rows = records.map((record, index) => {
    const lineUserId = cellString(record[lineUserIdKey]);
    const userTier = cellString(record[userTierKey]);
    const parsedTier = isUserTier(userTier) ? userTier : null;

    return {
      rowNumber: index + 2,
      lineUserId,
      userTier,
      parsedTier,
      status: toImportStatus(lineUserId, parsedTier),
    };
  });

  return {
    fileName: file.name,
    rows,
    readyCount: rows.filter((row) => row.status === "ready").length,
    errorCount: rows.filter((row) => row.status !== "ready").length,
  };
}
