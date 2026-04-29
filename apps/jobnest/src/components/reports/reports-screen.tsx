"use client";

import { IconTable } from "@tabler/icons-react";
import { Button, Checkbox, Combobox, Input } from "@jobnest/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { applicationsApi, type ApplicationListItem } from "../../lib/api/applications";
import { getErrorMessage } from "../../lib/error-handler";
import { STATUS_OPTIONS } from "../../lib/status";
import { showErrorToast } from "../../lib/toast";
import { ApplicationStatusBadge } from "../application-tracker/application-status-badge";
import { ExportDialog } from "./export-dialog";

const DEFAULT_STATUSES = ["applied"];
const STATUS_ITEMS = STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }));

export function ReportsScreen() {
  const [allApplications, setAllApplications] = useState<ApplicationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeStatuses, setActiveStatuses] = useState<string[]>(DEFAULT_STATUSES);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [isExportOpen, setIsExportOpen] = useState(false);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const groups = await applicationsApi.list();
      const apps = groups.flatMap((g) => g.applications);
      setAllApplications(apps);
      setSelectedIds(new Set(apps.map((a) => a.id)));
    } catch (error) {
      showErrorToast({
        title: "Could not load applications",
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const filteredApplications = useMemo(() => {
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
    const to = dateTo ? new Date(`${dateTo}T23:59:59`) : null;
    const filteringByDate = from !== null || to !== null;
    const statusSet = new Set(activeStatuses);

    return allApplications.filter((app) => {
      if (!statusSet.has(app.status)) return false;
      if (filteringByDate) {
        if (!app.appliedAt) return false;
        const date = new Date(app.appliedAt);
        if (from && date < from) return false;
        if (to && date > to) return false;
      }
      return true;
    });
  }, [allApplications, dateFrom, dateTo, activeStatuses]);

  useEffect(() => {
    setSelectedIds(new Set(filteredApplications.map((a) => a.id)));
  }, [filteredApplications]);

  const exportTarget = useMemo(
    () => filteredApplications.filter((app) => selectedIds.has(app.id)),
    [filteredApplications, selectedIds],
  );

  const allFilteredSelected =
    filteredApplications.length > 0 &&
    filteredApplications.every((app) => selectedIds.has(app.id));
  const someFilteredSelected = exportTarget.length > 0 && !allFilteredSelected;

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredApplications.map((a) => a.id)));
    }
  }

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const isDefaultStatuses =
    activeStatuses.length === DEFAULT_STATUSES.length &&
    DEFAULT_STATUSES.every((s) => activeStatuses.includes(s));
  const hasFilters = dateFrom !== "" || dateTo !== "" || !isDefaultStatuses;

  function clearFilters() {
    setDateFrom("");
    setDateTo("");
    setActiveStatuses(DEFAULT_STATUSES);
  }

  const selectionSummary = `${exportTarget.length} of ${filteredApplications.length} row${filteredApplications.length === 1 ? "" : "s"} selected`;

  return (
    <section className="flex h-full min-h-0 w-full flex-col">
      <div className="sticky top-0 z-10 w-full border-b border-border/40 backdrop-blur-xl backdrop-saturate-150 dark:bg-card/50">
        <div className="px-4 py-3 sm:px-5">
          <div className="mb-2">
            <h2>Reports</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Filter, select rows, and export to CSV or Excel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <label className="shrink-0 text-xs text-muted-foreground" htmlFor="date-from">
                From
              </label>
              <Input
                id="date-from"
                type="date"
                size="sm"
                value={dateFrom}
                onChange={(e) => setDateFrom((e.target as HTMLInputElement).value)}
                className="w-36"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="shrink-0 text-xs text-muted-foreground" htmlFor="date-to">
                To
              </label>
              <Input
                id="date-to"
                type="date"
                size="sm"
                value={dateTo}
                onChange={(e) => setDateTo((e.target as HTMLInputElement).value)}
                className="w-36"
              />
            </div>

            <div className="w-52">
              <Combobox
                items={STATUS_ITEMS}
                value={activeStatuses}
                onValueChange={(v) => setActiveStatuses(v.length > 0 ? v : DEFAULT_STATUSES)}
                placeholder="All statuses"
                size="sm"
              />
            </div>

            {hasFilters && (
              <Button type="button" variant="ghost" size="xs" onClick={clearFilters}>
                Clear
              </Button>
            )}

            <div className="ml-auto flex items-center gap-3">
              <p className="text-xs text-muted-foreground">{selectionSummary}</p>
              <Button
                type="button"
                variant="primary"
                size="xs"
                disabled={exportTarget.length === 0}
                onClick={() => setIsExportOpen(true)}
              >
                Export…
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="m-4 rounded-md border border-dashed border-border/70 px-5 py-8 text-sm text-muted-foreground sm:m-5">
            Loading applications…
          </div>
        ) : null}

        {!isLoading && allApplications.length === 0 ? (
          <div className="m-4 rounded-md border border-dashed border-border/70 px-5 py-8 text-sm text-muted-foreground sm:m-5">
            <div className="flex flex-col items-center gap-2 text-center">
              <IconTable className="size-8 opacity-30" aria-hidden="true" />
              <p>No applications tracked yet.</p>
            </div>
          </div>
        ) : null}

        {!isLoading && allApplications.length > 0 && filteredApplications.length === 0 ? (
          <div className="m-4 rounded-md border border-dashed border-border/70 px-5 py-8 text-sm text-muted-foreground sm:m-5">
            No applications match the current filters.
          </div>
        ) : null}

        {!isLoading && filteredApplications.length > 0 ? (
          <div className="bg-background/70">
            <div className="sticky top-0 z-10 grid grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,1fr)_8rem_9rem_9rem] gap-3 border-b border-border/50 bg-background/95 px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground backdrop-blur supports-[backdrop-filter]:bg-background/75">
              <span className="flex items-center">
                <Checkbox
                  aria-label="Select all rows"
                  checked={allFilteredSelected}
                  indeterminate={someFilteredSelected}
                  onCheckedChange={toggleSelectAll}
                />
              </span>
              <span>Company</span>
              <span>Role</span>
              <span>Status</span>
              <span>Applied</span>
              <span>Source</span>
            </div>

            <ol>
              {filteredApplications.map((app) => {
                const isSelected = selectedIds.has(app.id);
                return (
                  <li
                    key={app.id}
                    role="row"
                    aria-selected={isSelected}
                    className="grid grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,1fr)_8rem_9rem_9rem] items-center gap-3 border-b border-border/50 px-4 py-3 last:border-b-0 hover:bg-muted/30"
                  >
                    <span className="flex items-center">
                      <Checkbox
                        aria-label={`Select ${app.companyName} – ${app.roleTitle}`}
                        checked={isSelected}
                        onCheckedChange={() => toggleRow(app.id)}
                      />
                    </span>
                    <p className="truncate text-sm text-foreground">{app.companyName}</p>
                    <p className="truncate text-sm text-muted-foreground">{app.roleTitle}</p>
                    <span>
                      <ApplicationStatusBadge status={app.status} />
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {app.appliedAt
                        ? new Date(app.appliedAt).toLocaleDateString(undefined, { dateStyle: "medium" })
                        : <span className="opacity-40">—</span>}
                    </p>
                    <p className="truncate text-xs text-muted-foreground capitalize">
                      {app.applicationSource.split("_").join(" ")}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}
      </div>

      <ExportDialog
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        applications={exportTarget}
      />
    </section>
  );
}
