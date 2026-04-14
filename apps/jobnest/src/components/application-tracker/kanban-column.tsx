"use client";

import { memo, useMemo } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { ApplicationListItem } from "../../lib/form-mappers";
import {
  formatStatusLabel,
  type ApplicationStatus,
} from "../../lib/status";
import { ApplicationCard } from "./application-card";
import { trackerPanelClass } from "./styles";

type KanbanColumnProps = {
  status: ApplicationStatus;
  applications: ApplicationListItem[];
  movingApplicationId: string | null;
  onEdit: (application: ApplicationListItem) => void;
};

function KanbanColumnComponent({
  status,
  applications,
  movingApplicationId,
  onEdit,
}: KanbanColumnProps) {
  const itemIds = useMemo(() => applications.map((app) => app.id), [applications]);
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: "container",
      status,
    },
  });

  return (
    <section
      ref={setNodeRef}
      className={`${trackerPanelClass} flex flex-col ${
        isOver && applications.length > 0 ? "border-primary/50" : "border-border"
      }`}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">
          {formatStatusLabel(status)}
        </h3>
        <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
          {applications.length}
        </span>
      </header>

      <div className="p-4">
        <SortableContext
          items={itemIds}
          strategy={verticalListSortingStrategy}
        >
          {applications.length > 0 ? (
            <ul className="space-y-4">
              {applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  isDragging={movingApplicationId === application.id}
                  onEdit={onEdit}
                />
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-background/40 px-4 py-8 text-center text-sm text-muted-foreground">
              No applications in {formatStatusLabel(status).toLowerCase()}.
            </div>
          )}
        </SortableContext>
      </div>
    </section>
  );
}

export const KanbanColumn = memo(KanbanColumnComponent);
