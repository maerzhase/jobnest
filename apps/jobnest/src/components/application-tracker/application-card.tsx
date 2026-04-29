"use client";

import { memo, type ButtonHTMLAttributes } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical } from "@tabler/icons-react";
import type { ApplicationListItem } from "../../lib/form-mappers";
import { isStaleApplication } from "../../lib/stale-applications";
import { ApplicationStatusBadge } from "./application-status-badge";
import {
  getApplicationTimelineLabel,
  getSearchQueryState,
} from "./helpers";
import { HighlightedText } from "./highlighted-text";

type ApplicationCardProps = {
  application: ApplicationListItem;
  onEdit: (application: ApplicationListItem) => void;
  isDragging?: boolean;
  isSearchMatch?: boolean;
  searchQuery?: string;
  showStatus?: boolean;
  showDragHandle?: boolean;
  staleApplicationDays?: number;
};

type ApplicationCardContentProps = ApplicationCardProps & {
  dragHandleProps?: ButtonHTMLAttributes<HTMLButtonElement>;
};

function ApplicationCardContent({
  application,
  onEdit,
  searchQuery,
  showStatus = true,
  showDragHandle = false,
  dragHandleProps,
  staleApplicationDays,
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
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <ApplicationStatusBadge status={application.status} />
            </div>
          ) : null}

          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold leading-tight">
                <HighlightedText
                  query={searchQuery}
                  text={application.roleTitle}
                />
              </h3>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                <HighlightedText
                  query={searchQuery}
                  text={application.companyName}
                />
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            {application.salaryExpectation || application.salaryOffer ? (
              <p className="line-clamp-1">
                <HighlightedText
                  query={searchQuery}
                  text={[
                    application.salaryExpectation
                      ? `${application.salaryExpectation}`
                      : null,
                    application.salaryOffer ? `${application.salaryOffer}` : null,
                  ]
                    .filter(Boolean)
                    .join(" / ")}
                />
              </p>
            ) : null}
            <p className="line-clamp-1">
              <HighlightedText
                query={searchQuery}
                text={getApplicationTimelineLabel(application, staleApplicationDays)}
              />
            </p>
            {application.attachments.length > 0 ? (
              <p className="line-clamp-1">
                {application.attachments.length} attachment
                {application.attachments.length === 1 ? "" : "s"}
              </p>
            ) : null}
            {application.notes ? (
              <p className="line-clamp-2">
                <HighlightedText
                  query={searchQuery}
                  text={application.notes}
                />
              </p>
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
  isSearchMatch = true,
  searchQuery,
  showStatus = true,
  showDragHandle = false,
  staleApplicationDays,
}: ApplicationCardProps) {
  const isStale = isStaleApplication(application, staleApplicationDays);
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
  const { hasQuery } = getSearchQueryState(searchQuery);

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`group rounded-md border bg-card shadow-[0_1px_0_rgba(255,255,255,0.5)_inset] hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] ${
        isStale
          ? "border-dashed border-foreground/20 bg-linear-to-br from-foreground/[0.035] via-card to-card hover:border-foreground/30"
          : "border-border/70 hover:border-foreground/15"
      } ${
        isSortableDragging || isDragging
          ? "opacity-50"
          : hasQuery && !isSearchMatch
            ? "opacity-45"
            : ""
      }`}
    >
      <ApplicationCardContent
        application={application}
        dragHandleProps={{ ...attributes, ...listeners }}
        onEdit={onEdit}
        searchQuery={searchQuery}
        showDragHandle={showDragHandle}
        showStatus={showStatus}
        staleApplicationDays={staleApplicationDays}
      />
    </li>
  );
}

export const ApplicationCard = memo(ApplicationCardComponent);

export function ApplicationCardDragPreview({
  application,
  onEdit,
  staleApplicationDays,
}: Pick<ApplicationCardProps, "application" | "onEdit" | "staleApplicationDays">) {
  const isStale = isStaleApplication(application, staleApplicationDays);

  return (
    <div
      className={`rounded-md border bg-card shadow-[0_18px_40px_rgba(0,0,0,0.18)] ${
        isStale
          ? "border-dashed border-foreground/22 bg-linear-to-br from-foreground/[0.04] via-card to-card"
          : "border-foreground/15"
      }`}
    >
      <ApplicationCardContent
        application={application}
        onEdit={onEdit}
        searchQuery={undefined}
        showDragHandle
        showStatus={false}
        staleApplicationDays={staleApplicationDays}
      />
    </div>
  );
}
