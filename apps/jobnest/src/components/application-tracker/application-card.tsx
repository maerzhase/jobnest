"use client";

import { formatDate } from "../../lib/date";
import type { ApplicationListItem } from "../../lib/form-mappers";
import { ApplicationStatusBadge } from "./application-status-badge";

type ApplicationCardProps = {
  application: ApplicationListItem;
  onEdit: (application: ApplicationListItem) => void;
};

function getTimelineLabel(application: ApplicationListItem): string {
  if (application.firstResponseAt) {
    if (application.appliedAt) {
      return `Applied ${formatDate(application.appliedAt)} · First answer ${formatDate(application.firstResponseAt)}`;
    }

    return `First answer ${formatDate(application.firstResponseAt)}`;
  }

  if (application.appliedAt) {
    return `Applied ${formatDate(application.appliedAt)}`;
  }

  return `Saved ${formatDate(application.updatedAt)}`;
}

export function ApplicationCard({
  application,
  onEdit,
}: ApplicationCardProps) {
  return (
    <li className="group rounded-lg border border-border bg-background/70 transition-all hover:border-foreground/30 hover:shadow-md">
      <button
        className="w-full px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onClick={() => onEdit(application)}
        type="button"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold leading-tight truncate">
              {application.roleTitle}
            </h3>
            <p className="text-xs text-muted-foreground truncate mt-1">
              {application.companyName}
            </p>
          </div>
        </div>

        <div className="mb-3">
          <ApplicationStatusBadge status={application.status} />
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          {application.salaryExpectation || application.salaryOffer ? (
            <p className="line-clamp-1">
              {[
                application.salaryExpectation
                  ? `${application.salaryExpectation}`
                  : null,
                application.salaryOffer ? `${application.salaryOffer}` : null,
              ]
                .filter(Boolean)
                .join(" / ")}
            </p>
          ) : null}
          <p className="line-clamp-1">{getTimelineLabel(application)}</p>
          {application.notes ? (
            <p className="line-clamp-2">{application.notes}</p>
          ) : null}
        </div>
      </button>
      {application.jobPostUrl ? (
        <div className="px-4 pb-3 pt-1">
          <a
            className="text-xs font-medium text-foreground/70 hover:text-foreground transition-colors"
            href={application.jobPostUrl}
            rel="noreferrer"
            target="_blank"
          >
            Open post →
          </a>
        </div>
      ) : null}
    </li>
  );
}
