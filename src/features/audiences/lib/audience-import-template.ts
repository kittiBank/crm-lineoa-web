import * as XLSX from "xlsx";

export const AUDIENCE_IMPORT_TEMPLATE_FILENAME = "audience-import-template.xlsx";
export const AUDIENCE_IMPORT_MAX_BYTES = 10 * 1024 * 1024;
export const AUDIENCE_IMPORT_EXTENSIONS = [".xlsx", ".csv"];
export const AUDIENCE_IMPORT_ACCEPT =
  ".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv";

// Sample tel nos are text cells ("@") so Excel keeps the leading zero.
function textCell(value: string): XLSX.CellObject {
  return { t: "s", v: value, z: "@" };
}

export function downloadAudienceImportTemplate() {
  const sheet = XLSX.utils.aoa_to_sheet([
    ["telNo", "userTier"],
    [textCell("0812345678"), "GOLD"],
    [textCell("0898765432"), "SILVER"],
    [textCell("0611111111"), "PLATINUM"],
  ]);
  sheet["!cols"] = [{ wch: 16 }, { wch: 12 }];

  // Only the first sheet is imported; this one is for reference.
  const notes = XLSX.utils.aoa_to_sheet([
    ["Column", "Rule"],
    ["telNo", "Thai mobile number, e.g. 0812345678 (dashes/spaces allowed)"],
    ["userTier", "SILVER, GOLD or PLATINUM (uppercase only)"],
    ["", "Any invalid row blocks the whole import. Max 50,000 rows, 10 MB."],
  ]);
  notes["!cols"] = [{ wch: 10 }, { wch: 70 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Audience");
  XLSX.utils.book_append_sheet(workbook, notes, "Instructions");
  XLSX.writeFile(workbook, AUDIENCE_IMPORT_TEMPLATE_FILENAME);
}

/** Quick client-side check; the API validates again. Returns an error or null. */
export function checkAudienceImportFile(file: File): string | null {
  const name = file.name.toLowerCase();
  if (!AUDIENCE_IMPORT_EXTENSIONS.some((extension) => name.endsWith(extension))) {
    return "Only .xlsx and .csv files are supported";
  }
  if (file.size === 0) {
    return "The file is empty";
  }
  if (file.size > AUDIENCE_IMPORT_MAX_BYTES) {
    return "File is larger than 10 MB";
  }
  return null;
}
