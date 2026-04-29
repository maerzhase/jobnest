"use client";

import { IconFileSpreadsheet, IconFileTypeCsv } from "@tabler/icons-react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogDescriptionText,
  DialogFooter,
  DialogHeader,
  DialogTitleText,
  ToggleGroup,
  ToggleGroupItem,
} from "@jobnest/ui";
import { useState } from "react";
import type { ApplicationListItem } from "../../lib/api/applications";
import { getErrorMessage } from "../../lib/error-handler";
import {
  EXPORT_COLUMNS,
  type ExportColumn,
  exportCsv,
  exportXls,
} from "../../lib/report-export";
import { showErrorToast, showSuccessToast } from "../../lib/toast";

type ExportFormat = "csv" | "xlsx";

type ExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applications: ApplicationListItem[];
};

export function ExportDialog({
  open,
  onOpenChange,
  applications,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("xlsx");
  const [selectedColumns, setSelectedColumns] = useState<Set<ExportColumn>>(
    () => new Set(EXPORT_COLUMNS.map((c) => c.key)),
  );
  const [isExporting, setIsExporting] = useState(false);

  const allColumnsSelected = selectedColumns.size === EXPORT_COLUMNS.length;
  const someColumnsSelected = selectedColumns.size > 0 && !allColumnsSelected;

  function toggleColumn(key: ExportColumn) {
    setSelectedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAllColumns() {
    setSelectedColumns(
      allColumnsSelected ? new Set() : new Set(EXPORT_COLUMNS.map((c) => c.key)),
    );
  }

  async function handleExport() {
    if (selectedColumns.size === 0) return;

    setIsExporting(true);
    try {
      const result =
        format === "csv"
          ? await exportCsv(applications, selectedColumns)
          : await exportXls(applications, selectedColumns);

      if (result === "saved") {
        showSuccessToast({
          title: "Report exported",
          description: `${applications.length} row${applications.length === 1 ? "" : "s"} · ${selectedColumns.size} column${selectedColumns.size === 1 ? "" : "s"} exported as ${format.toUpperCase()}.`,
        });
        onOpenChange(false);
      }
    } catch (error) {
      const msg = getErrorMessage(error);
      if (msg && !msg.toLowerCase().includes("cancelled")) {
        showErrorToast({ title: "Export failed", description: msg });
      }
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitleText>Export report</DialogTitleText>
          <DialogDescriptionText>
            {applications.length} row{applications.length === 1 ? "" : "s"} selected
          </DialogDescriptionText>
        </DialogHeader>

        <div className="mb-6 space-y-5">
          <div>
            <p className="mb-2.5 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Format
            </p>
            <ToggleGroup
              value={format}
              onValueChange={(v) => { if (v) setFormat(v as ExportFormat); }}
              size="md"
              className="w-full"
            >
              <ToggleGroupItem value="xlsx" className="flex-1 gap-2">
                <IconFileSpreadsheet className="size-4 shrink-0" aria-hidden="true" />
                Excel (.xlsx)
              </ToggleGroupItem>
              <ToggleGroupItem value="csv" className="flex-1 gap-2">
                <IconFileTypeCsv className="size-4 shrink-0" aria-hidden="true" />
                CSV (.csv)
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Columns
              </p>
              <span className="text-xs text-muted-foreground">
                {selectedColumns.size} of {EXPORT_COLUMNS.length}
              </span>
            </div>
            <div className="divide-y divide-border/50 rounded-md border border-border/70">
              <div className="flex items-center gap-3 px-3 py-2 hover:bg-muted/40">
                <Checkbox
                  id="export-col-all"
                  checked={allColumnsSelected}
                  indeterminate={someColumnsSelected}
                  onCheckedChange={toggleAllColumns}
                />
                <label
                  htmlFor="export-col-all"
                  className="cursor-pointer text-sm font-medium text-foreground"
                >
                  All columns
                </label>
              </div>
              {EXPORT_COLUMNS.map((col) => (
                <div
                  key={col.key}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-muted/40"
                >
                  <Checkbox
                    id={`export-col-${col.key}`}
                    checked={selectedColumns.has(col.key)}
                    onCheckedChange={() => toggleColumn(col.key)}
                  />
                  <label
                    htmlFor={`export-col-${col.key}`}
                    className="cursor-pointer text-sm text-foreground"
                  >
                    {col.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogCloseButton type="button">Cancel</DialogCloseButton>
          <Button
            type="button"
            variant="primary"
            disabled={
              isExporting ||
              selectedColumns.size === 0 ||
              applications.length === 0
            }
            onClick={handleExport}
          >
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
