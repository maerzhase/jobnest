"use client";

import { memo, useMemo } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { ApplicationListItem } from "../../lib/form-mappers";
import type { ApplicationStatus } from "../../lib/status";
import { ApplicationStatusBadge } from "./application-status-badge";
import { ApplicationCard } from "./application-card";
import { trackerPanelClass } from "./styles";

type KanbanColumnProps = {
  status: ApplicationStatus;
  applications: ApplicationListItem[];
  movingApplicationId: string | null;
  onEdit: (application: ApplicationListItem) => void;
  searchMatchesById: Map<string, boolean>;
  searchQuery: string;
  staleApplicationDays?: number;
};

function KanbanColumnComponent({
  status,
  applications,
  movingApplicationId,
  onEdit,
  searchMatchesById,
  searchQuery,
  staleApplicationDays,
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
      className={`${trackerPanelClass} flex h-full min-h-0 flex-col ${
        isOver && applications.length > 0 ? "border-primary/50" : "border-border"
      }`}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h3>
          <ApplicationStatusBadge status={status} />
        </h3>
        <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
          {applications.length}
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <SortableContext
          items={itemIds}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-4">
            {applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                isDragging={movingApplicationId === application.id}
                isSearchMatch={searchMatchesById.get(application.id) ?? true}
                onEdit={onEdit}
                searchQuery={searchQuery}
                showDragHandle
                showStatus={false}
                staleApplicationDays={staleApplicationDays}
              />
            ))}
          </ul>
        </SortableContext>
      </div>
    </section>
  );
}

export const KanbanColumn = memo(KanbanColumnComponent);
