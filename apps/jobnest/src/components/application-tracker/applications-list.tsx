"use client";

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTriggerButton,
} from "@jobnest/ui";
import {
  DndContext,
  DragOverlay,
  type DragCancelEvent,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  closestCenter,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ApplicationStatusGroup } from "../../lib/api/applications";
import type { ApplicationListItem } from "../../lib/form-mappers";
import {
  STATUS_OPTIONS,
  type ApplicationStatus,
} from "../../lib/status";
import { ApplicationCard, ApplicationCardDragPreview } from "./application-card";
import { ApplicationStatusBadge } from "./application-status-badge";
import {
  getApplicationTimelineLabel,
  getSearchQueryState,
} from "./helpers";
import { KanbanColumn } from "./kanban-column";
import { useApplicationSearch } from "./search-context";
import { trackerPanelClass } from "./styles";

type ApplicationsListProps = {
  emptyDescription?: string;
  emptyTitle?: string;
  groups: ApplicationStatusGroup[];
  isLoading: boolean;
  onEdit: (application: ApplicationListItem) => void;
  onMoveToStatus: (
    application: ApplicationListItem,
    status: ApplicationStatus
  ) => Promise<void>;
  movingApplicationId: string | null;
  staleApplicationDays?: number;
  viewMode: "list" | "kanban";
};

type KanbanGroup = {
  status: ApplicationStatus;
  applications: ApplicationListItem[];
};

function asApplicationStatus(status: string): ApplicationStatus | null {
  return STATUS_OPTIONS.some((statusOption) => statusOption.value === status)
    ? (status as ApplicationStatus)
    : null;
}

function matchesApplicationSearch(
  application: ApplicationListItem,
  normalizedSearchQuery: string,
  staleApplicationDays?: number
): boolean {
  if (!normalizedSearchQuery) {
    return true;
  }

  const searchableFields = [
    application.roleTitle,
    application.companyName,
    application.notes,
    application.applicationSource,
    application.salaryExpectation,
    application.salaryOffer,
    application.jobPostUrl,
    getApplicationTimelineLabel(application, staleApplicationDays),
  ];

  return searchableFields.some((field) =>
    field?.toLocaleLowerCase().includes(normalizedSearchQuery)
  );
}

function sortApplicationsBySearch(
  applications: ApplicationListItem[],
  searchMatchesById: Map<string, boolean>,
  hasSearchQuery: boolean
): ApplicationListItem[] {
  if (!hasSearchQuery) {
    return applications;
  }

  const matches: ApplicationListItem[] = [];
  const nonMatches: ApplicationListItem[] = [];

  for (const application of applications) {
    if (searchMatchesById.get(application.id)) {
      matches.push(application);
    } else {
      nonMatches.push(application);
    }
  }

  return [...matches, ...nonMatches];
}

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
  emptyDescription,
  emptyTitle,
  groups,
  isLoading,
  onEdit,
  onMoveToStatus,
  movingApplicationId,
  staleApplicationDays,
  viewMode,
}: ApplicationsListProps) {
  const { deferredSearchQuery } = useApplicationSearch();
  const searchQuery = deferredSearchQuery;
  const { hasQuery: hasSearchQuery, normalizedQuery: normalizedSearchQuery, trimmedQuery: trimmedSearchQuery } =
    getSearchQueryState(searchQuery);
  const applicationsById = useMemo(
    () =>
      new Map(
        groups.flatMap((group) =>
          group.applications.map((application) => [application.id, application] as const)
        )
      ),
    [groups]
  );
  const searchMatchesById = useMemo(
    () =>
      new Map(
        groups.flatMap((group) =>
          group.applications.map((application) => [
            application.id,
            matchesApplicationSearch(
              application,
              normalizedSearchQuery,
              staleApplicationDays
            ),
          ] as const)
        )
      ),
    [groups, normalizedSearchQuery, staleApplicationDays]
  );
  const sortedListGroups = useMemo(
    () =>
      groups.map((group) => ({
        ...group,
        applications: sortApplicationsBySearch(
          group.applications,
          searchMatchesById,
          hasSearchQuery
        ),
      })),
    [groups, hasSearchQuery, searchMatchesById]
  );

  const [kanbanGroups, setKanbanGroups] = useState<KanbanGroup[]>(() =>
    buildKanbanGroups(groups)
  );
  const [openStatuses, setOpenStatuses] = useState<Set<ApplicationStatus>>(
    () => {
      const initialStatus = groups[0] ? asApplicationStatus(groups[0].status) : null;
      return new Set(initialStatus ? [initialStatus] : []);
    }
  );
  const [dragPreviewApplication, setDragPreviewApplication] =
    useState<ApplicationListItem | null>(null);
  const [dragPreviewWidth, setDragPreviewWidth] =
    useState<number | undefined>(undefined);
  const [dragOverlayContainer, setDragOverlayContainer] =
    useState<HTMLElement | null>(null);
  const kanbanGroupsRef = useRef<KanbanGroup[]>(kanbanGroups);
  const previousKanbanGroupsRef = useRef<KanbanGroup[] | null>(null);

  useEffect(() => {
    setDragOverlayContainer(document.body);
  }, []);

  useEffect(() => {
    const nextGroups = buildKanbanGroups(groups);
    kanbanGroupsRef.current = nextGroups;
    setKanbanGroups(nextGroups);
  }, [groups]);

  useEffect(() => {
    setOpenStatuses((current) => {
      const availableStatuses = new Set(
        groups
          .map((group) => asApplicationStatus(group.status))
          .filter((status) => status !== null)
      );
      const nextOpenStatuses = new Set(
        [...current].filter((status) => availableStatuses.has(status))
      );

      const firstStatus = groups[0] ? asApplicationStatus(groups[0].status) : null;

      if (nextOpenStatuses.size === 0 && firstStatus) {
        nextOpenStatuses.add(firstStatus);
      }

      return nextOpenStatuses;
    });
  }, [groups]);

  const sortedKanbanGroups = useMemo(
    () =>
      kanbanGroups.map((group) => ({
        ...group,
        applications: sortApplicationsBySearch(
          group.applications,
          searchMatchesById,
          hasSearchQuery
        ),
      })),
    [hasSearchQuery, kanbanGroups, searchMatchesById]
  );
  const searchMatchedStatuses = useMemo(
    () =>
      new Set(
        groups
          .filter((group) =>
            group.applications.some((application) =>
              searchMatchesById.get(application.id)
            )
          )
          .map((group) => asApplicationStatus(group.status))
          .filter((status) => status !== null)
      ),
    [groups, searchMatchesById]
  );

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
        <p className="text-base font-medium">{emptyTitle ?? "Nothing tracked yet"}</p>
        <p className="text-muted-foreground mt-2 text-sm">
          {emptyDescription ??
            "Add your first application to start building your local history."}
        </p>
      </div>
    );
  }

  const handleDragStart = (event: DragStartEvent) => {
    previousKanbanGroupsRef.current = kanbanGroupsRef.current;
    setDragPreviewApplication(
      applicationsById.get(event.active.id as string) ?? null
    );
    setDragPreviewWidth(event.active.rect.current.initial?.width);
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    if (previousKanbanGroupsRef.current) {
      setTrackedKanbanGroups(previousKanbanGroupsRef.current);
      previousKanbanGroupsRef.current = null;
    }
    setDragPreviewApplication(null);
    setDragPreviewWidth(undefined);
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
    setDragPreviewApplication(null);
    setDragPreviewWidth(undefined);

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
    const dragOverlay = (
      <DragOverlay>
        {dragPreviewApplication ? (
          <div
            style={{
              width: dragPreviewWidth,
            }}
          >
            <ApplicationCardDragPreview
              application={dragPreviewApplication}
              onEdit={onEdit}
              staleApplicationDays={staleApplicationDays}
            />
          </div>
        ) : null}
      </DragOverlay>
    );

    return (
      <DndContext
        collisionDetection={closestCenter}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
      >
        <div className="-mx-4 min-h-0 flex-1 overflow-x-auto overflow-y-hidden pb-4 sm:-mx-5">
          <div className="h-full min-h-0 px-4 sm:px-5">
            <div className="grid h-full min-w-max auto-cols-[16rem] grid-flow-col gap-4">
              {sortedKanbanGroups.map((group) => (
                <KanbanColumn
                  key={group.status}
                  status={group.status}
                  applications={group.applications}
                  movingApplicationId={movingApplicationId}
                  onEdit={onEdit}
                  searchMatchesById={searchMatchesById}
                  searchQuery={trimmedSearchQuery}
                  staleApplicationDays={staleApplicationDays}
                />
              ))}
            </div>
          </div>
        </div>
        {dragOverlayContainer
          ? createPortal(dragOverlay, dragOverlayContainer)
          : dragOverlay}
      </DndContext>
    );
  }

  return (
    <div className="space-y-4">
      {sortedListGroups.map((group) => {
        const groupStatus = asApplicationStatus(group.status);

        return (
          <Collapsible
            key={group.status}
            className={trackerPanelClass}
            onOpenChange={(open) => {
              if (!groupStatus) {
                return;
              }

              setOpenStatuses((current) => {
                const nextOpenStatuses = new Set(current);

                if (open) {
                  nextOpenStatuses.add(groupStatus);
                } else {
                  nextOpenStatuses.delete(groupStatus);
                }

                return nextOpenStatuses;
              });
            }}
            open={
              groupStatus
                ? openStatuses.has(groupStatus) ||
                  (hasSearchQuery && searchMatchedStatuses.has(groupStatus))
                : false
            }
          >
          <CollapsibleTriggerButton className="hover:bg-muted/40">
            <span className="flex min-w-0 items-center gap-3">
              <ApplicationStatusBadge status={group.status} />
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
                    isSearchMatch={searchMatchesById.get(application.id) ?? true}
                    onEdit={onEdit}
                    searchQuery={trimmedSearchQuery}
                    staleApplicationDays={staleApplicationDays}
                  />
                ))}
              </ul>
            </div>
          </CollapsiblePanel>
          </Collapsible>
        );
      })}
    </div>
  );
}
