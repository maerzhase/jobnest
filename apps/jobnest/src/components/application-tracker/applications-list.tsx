"use client";

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTriggerButton,
} from "@jobnest/ui";
import {
  DndContext,
  type DragCancelEvent,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  closestCenter,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ApplicationStatusGroup } from "../../lib/api/applications";
import type { ApplicationListItem } from "../../lib/form-mappers";
import {
  formatStatusLabel,
  STATUS_OPTIONS,
  type ApplicationStatus,
} from "../../lib/status";
import { ApplicationCard } from "./application-card";
import { KanbanColumn } from "./kanban-column";
import { trackerPanelClass } from "./styles";

type ApplicationsListProps = {
  groups: ApplicationStatusGroup[];
  isLoading: boolean;
  onEdit: (application: ApplicationListItem) => void;
  onMoveToStatus: (
    application: ApplicationListItem,
    status: ApplicationStatus
  ) => Promise<void>;
  movingApplicationId: string | null;
  viewMode: "list" | "kanban";
};

type KanbanGroup = {
  status: ApplicationStatus;
  applications: ApplicationListItem[];
};

function buildKanbanGroups(groups: ApplicationStatusGroup[]): KanbanGroup[] {
  const groupsByStatus = new Map(
    groups.map((group) => [group.status, group.applications] as const)
  );

  return STATUS_OPTIONS.map((statusOption) => ({
    status: statusOption.value,
    applications: [...(groupsByStatus.get(statusOption.value) ?? [])],
  }));
}

function findContainer(
  id: string,
  kanbanGroups: KanbanGroup[]
): ApplicationStatus | null {
  if (STATUS_OPTIONS.some((statusOption) => statusOption.value === id)) {
    return id as ApplicationStatus;
  }

  return (
    kanbanGroups.find((group) =>
      group.applications.some((application) => application.id === id)
    )?.status ?? null
  );
}

export function ApplicationsList({
  groups,
  isLoading,
  onEdit,
  onMoveToStatus,
  movingApplicationId,
  viewMode,
}: ApplicationsListProps) {
  const applicationsById = useMemo(
    () =>
      new Map(
        groups.flatMap((group) =>
          group.applications.map((application) => [application.id, application] as const)
        )
      ),
    [groups]
  );

  const [kanbanGroups, setKanbanGroups] = useState<KanbanGroup[]>(() =>
    buildKanbanGroups(groups)
  );
  const kanbanGroupsRef = useRef<KanbanGroup[]>(kanbanGroups);
  const previousKanbanGroupsRef = useRef<KanbanGroup[] | null>(null);

  useEffect(() => {
    const nextGroups = buildKanbanGroups(groups);
    kanbanGroupsRef.current = nextGroups;
    setKanbanGroups(nextGroups);
  }, [groups]);

  const setTrackedKanbanGroups = (
    updater: KanbanGroup[] | ((current: KanbanGroup[]) => KanbanGroup[])
  ) => {
    setKanbanGroups((current) => {
      const nextGroups =
        typeof updater === "function" ? updater(current) : updater;
      kanbanGroupsRef.current = nextGroups;
      return nextGroups;
    });
  };

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

  const handleDragStart = (_event: DragStartEvent) => {
    previousKanbanGroupsRef.current = kanbanGroupsRef.current;
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    if (previousKanbanGroupsRef.current) {
      setTrackedKanbanGroups(previousKanbanGroupsRef.current);
      previousKanbanGroupsRef.current = null;
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over || movingApplicationId) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeContainer = findContainer(activeId, kanbanGroupsRef.current);
    const overContainer = findContainer(overId, kanbanGroupsRef.current);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setTrackedKanbanGroups((currentGroups) => {
      const activeGroup = currentGroups.find(
        (group) => group.status === activeContainer
      );
      const overGroup = currentGroups.find(
        (group) => group.status === overContainer
      );

      if (!activeGroup || !overGroup) {
        return currentGroups;
      }

      const activeIndex = activeGroup.applications.findIndex(
        (application) => application.id === activeId
      );
      const overIndex = overGroup.applications.findIndex(
        (application) => application.id === overId
      );

      if (activeIndex < 0) {
        return currentGroups;
      }

      const isOverContainer = overId === overContainer;
      const isBelowOverItem =
        !isOverContainer &&
        active.rect.current.translated != null &&
        active.rect.current.translated.top >
          over.rect.top + over.rect.height;
      const modifier = isBelowOverItem ? 1 : 0;
      const newIndex =
        overIndex >= 0 ? overIndex + modifier : overGroup.applications.length;

      const activeApplication = activeGroup.applications[activeIndex];
      const nextApplication = {
        ...activeApplication,
        status: overContainer,
      };

      return currentGroups.map((group) => {
        if (group.status === activeContainer) {
          return {
            ...group,
            applications: group.applications.filter(
              (application) => application.id !== activeId
            ),
          };
        }

        if (group.status === overContainer) {
          const nextApplications = [...group.applications];
          nextApplications.splice(newIndex, 0, nextApplication);

          return {
            ...group,
            applications: nextApplications,
          };
        }

        return group;
      });
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const applicationId = active.id as string;

    if (!over || movingApplicationId) {
      previousKanbanGroupsRef.current = null;
      return;
    }

    const application = applicationsById.get(applicationId);

    if (!application) {
      previousKanbanGroupsRef.current = null;
      return;
    }

    const activeContainer = findContainer(applicationId, kanbanGroupsRef.current);
    const overContainer = findContainer(over.id as string, kanbanGroupsRef.current);

    if (!activeContainer || !overContainer) {
      previousKanbanGroupsRef.current = null;
      return;
    }

    if (activeContainer === overContainer) {
      setTrackedKanbanGroups((currentGroups) =>
        currentGroups.map((group) => {
          if (group.status !== activeContainer) {
            return group;
          }

          const oldIndex = group.applications.findIndex(
            (item) => item.id === applicationId
          );
          const newIndex = group.applications.findIndex(
            (item) => item.id === (over.id as string)
          );

          if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
            return group;
          }

          return {
            ...group,
            applications: arrayMove(group.applications, oldIndex, newIndex),
          };
        })
      );
    }

    previousKanbanGroupsRef.current = null;

    if (application.status !== overContainer) {
      await onMoveToStatus(application, overContainer);
    }
  };

  if (viewMode === "kanban") {
    return (
      <DndContext
        collisionDetection={closestCenter}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
      >
        <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2">
          <div className="overflow-x-auto pb-2">
            <div className="mx-auto w-full max-w-6xl px-6">
              <div className="grid min-w-max grid-flow-col gap-4 auto-cols-[16rem] items-start">
                {kanbanGroups.map((group) => (
                  <KanbanColumn
                    key={group.status}
                    status={group.status}
                    applications={group.applications}
                    movingApplicationId={movingApplicationId}
                    onEdit={onEdit}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </DndContext>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group, index) => (
        <Collapsible
          key={group.status}
          className={trackerPanelClass}
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
