import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import * as XLSX from "xlsx";
import type { ApplicationListItem } from "./api/applications";
import { formatDate } from "./date";

export const EXPORT_COLUMNS = [
  { key: "company", label: "Company" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "appliedAt", label: "Applied At" },
  { key: "firstResponseAt", label: "First Response" },
  { key: "source", label: "Source" },
  { key: "salaryExpectation", label: "Salary Expectation" },
  { key: "salaryOffer", label: "Salary Offer" },
] as const satisfies readonly { key: string; label: string }[];

export type ExportColumn = (typeof EXPORT_COLUMNS)[number]["key"];

function formatSource(source: string): string {
  return source
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

function toRows(
  applications: ApplicationListItem[],
  columns: Set<ExportColumn>,
): Record<string, string>[] {
  return applications.map((app) => {
    const row: Record<string, string> = {};
    if (columns.has("company")) row.Company = app.companyName;
    if (columns.has("role")) row.Role = app.roleTitle;
    if (columns.has("status"))
      row.Status = app.status.charAt(0).toUpperCase() + app.status.slice(1);
    if (columns.has("appliedAt"))
      row["Applied At"] = app.appliedAt ? formatDate(app.appliedAt) : "";
    if (columns.has("firstResponseAt"))
      row["First Response"] = app.firstResponseAt
        ? formatDate(app.firstResponseAt)
        : "";
    if (columns.has("source")) row.Source = formatSource(app.applicationSource);
    if (columns.has("salaryExpectation"))
      row["Salary Expectation"] = app.salaryExpectation ?? "";
    if (columns.has("salaryOffer")) row["Salary Offer"] = app.salaryOffer ?? "";
    return row;
  });
}

function buildTimestamp(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

export async function exportCsv(
  applications: ApplicationListItem[],
  columns: Set<ExportColumn>,
): Promise<"saved" | "cancelled"> {
  const filePath = await save({
    defaultPath: `jobnest-report-${buildTimestamp()}.csv`,
    filters: [{ name: "CSV", extensions: ["csv"] }],
  });

  if (!filePath) return "cancelled";

  const rows = toRows(applications, columns);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  await writeFile(filePath, new TextEncoder().encode(csv));

  return "saved";
}

export async function exportXls(
  applications: ApplicationListItem[],
  columns: Set<ExportColumn>,
): Promise<"saved" | "cancelled"> {
  const filePath = await save({
    defaultPath: `jobnest-report-${buildTimestamp()}.xlsx`,
    filters: [{ name: "Excel Workbook", extensions: ["xlsx"] }],
  });

  if (!filePath) return "cancelled";

  const rows = toRows(applications, columns);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

  const buffer = XLSX.write(workbook, {
    type: "array",
    bookType: "xlsx",
  }) as ArrayBuffer;
  await writeFile(filePath, new Uint8Array(buffer));

  return "saved";
}
