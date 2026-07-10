import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import writeXlsxFile from "write-excel-file/browser";
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

function toTable(
  applications: ApplicationListItem[],
  columns: Set<ExportColumn>,
): string[][] {
  const headers = EXPORT_COLUMNS.filter(({ key }) => columns.has(key)).map(
    ({ label }) => label,
  );
  const rows = toRows(applications, columns);

  return [
    headers,
    ...rows.map((row) => headers.map((header) => row[header] ?? "")),
  ];
}

function escapeCsvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function toCsv(table: string[][]): string {
  return table.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
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

  const csv = toCsv(toTable(applications, columns));
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

  const table = toTable(applications, columns).map((row) =>
    row.map((value) => ({ value, type: String })),
  );
  const workbook = writeXlsxFile(table, { sheet: "Applications" });
  const blob = await workbook.toBlob();
  const buffer = await blob.arrayBuffer();
  await writeFile(filePath, new Uint8Array(buffer));

  return "saved";
}
