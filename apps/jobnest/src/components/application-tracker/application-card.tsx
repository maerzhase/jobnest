"use client";

import { memo, type ButtonHTMLAttributes } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical } from "@tabler/icons-react";
import { formatDate } from "../../lib/date";
import type { ApplicationListItem } from "../../lib/form-mappers";
import { ApplicationStatusBadge } from "./application-status-badge";

type ApplicationCardProps = {
  application: ApplicationListItem;
  onEdit: (application: ApplicationListItem) => void;
  isDragging?: boolean;
  showStatus?: boolean;
  showDragHandle?: boolean;
};

type ApplicationCardContentProps = ApplicationCardProps & {
  dragHandleProps?: ButtonHTMLAttributes<HTMLButtonElement>;
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

function ApplicationCardContent({
  application,
  onEdit,
  showStatus = true,
  showDragHandle = false,
  dragHandleProps,
}: ApplicationCardContentProps) {
  return (
    <div className="flex items-stretch">
      <div className="flex min-w-0 flex-1 flex-col">
        <button
          className="min-w-0 flex-1 px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={() => onEdit(application)}
          type="button"
        >
          {showStatus ? (
            <div className="mb-3">
              <ApplicationStatusBadge status={application.status} />
            </div>
          ) : null}

          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold leading-tight">
                {application.roleTitle}
              </h3>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {application.companyName}
              </p>
            </div>
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
              className="text-xs font-medium text-foreground/70 hover:text-foreground"
              href={application.jobPostUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open post →
            </a>
          </div>
        ) : null}
      </div>

      {showDragHandle ? (
        <button
          aria-label={`Drag ${application.roleTitle}`}
          className="flex w-10 shrink-0 cursor-grab touch-none items-center justify-center self-stretch rounded-r-xl border-l border-border/70 text-muted-foreground hover:bg-muted/60 hover:text-foreground active:cursor-grabbing"
          type="button"
          {...dragHandleProps}
        >
          <IconGripVertical aria-hidden="true" className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

function ApplicationCardComponent({
  application,
  onEdit,
  isDragging = false,
  showStatus = true,
  showDragHandle = false,
}: ApplicationCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isSortableDragging,
  } = useSortable({
    id: application.id,
    data: {
      type: "card",
      application,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`group rounded-xl border border-border/70 bg-card shadow-[0_1px_0_rgba(255,255,255,0.5)_inset] hover:border-foreground/15 hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] ${
        isSortableDragging || isDragging
          ? "opacity-50"
          : ""
      }`}
    >
      <ApplicationCardContent
        application={application}
        dragHandleProps={{ ...attributes, ...listeners }}
        onEdit={onEdit}
        showDragHandle={showDragHandle}
        showStatus={showStatus}
      />
    </li>
  );
}

export const ApplicationCard = memo(ApplicationCardComponent);

export function ApplicationCardDragPreview({
  application,
  onEdit,
}: Pick<ApplicationCardProps, "application" | "onEdit">) {
  return (
    <div className="rounded-xl border border-foreground/15 bg-card shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
      <ApplicationCardContent
        application={application}
        onEdit={onEdit}
        showDragHandle
        showStatus={false}
      />
    </div>
  );
}
