"use client";

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTriggerButton,
} from "@jobnest/ui";
import type { ApplicationStatusGroup } from "../../lib/api/applications";
import type { ApplicationListItem } from "../../lib/form-mappers";
import { formatStatusLabel } from "../../lib/status";
import { ApplicationCard } from "./application-card";

type ApplicationsListProps = {
  groups: ApplicationStatusGroup[];
  isLoading: boolean;
  onEdit: (application: ApplicationListItem) => void;
};

export function ApplicationsList({
  groups,
  isLoading,
  onEdit,
}: ApplicationsListProps) {
  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading applications...
      </p>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border px-5 py-10 text-center">
        <p className="text-base font-medium">Nothing tracked yet</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Add your first application to start building your local history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group, index) => (
        <Collapsible
          key={group.status}
          className="rounded-xl border border-border bg-card/70"
          defaultOpen={index === 0}
        >
          <CollapsibleTriggerButton className="hover:bg-muted/40">
            <span className="flex min-w-0 items-center gap-3">
              <span className="text-sm font-semibold">
                {formatStatusLabel(group.status)}
              </span>
              <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                {group.applications.length}
              </span>
            </span>
            <svg
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M4 6.5L8 10L12 6.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </CollapsibleTriggerButton>
          <CollapsiblePanel>
            <div className="border-t border-border px-4 py-4">
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.applications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onEdit={onEdit}
                  />
                ))}
              </ul>
            </div>
          </CollapsiblePanel>
        </Collapsible>
      ))}
    </div>
  );
}
