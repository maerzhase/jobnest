"use client";

import type { ApplicationListItem } from "../../lib/form-mappers";
import { ApplicationCard } from "./application-card";

type ApplicationsListProps = {
  applications: ApplicationListItem[];
  isLoading: boolean;
  onEdit: (application: ApplicationListItem) => void;
};

export function ApplicationsList({
  applications,
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

  if (applications.length === 0) {
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
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {applications.map((application) => (
        <ApplicationCard
          key={application.id}
          application={application}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
}
