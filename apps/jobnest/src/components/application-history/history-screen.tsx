"use client";

import {
  IconEdit,
  IconFilePlus,
  IconHistory,
  IconSearch,
  IconTrash,
  IconTransitionTop,
} from "@tabler/icons-react";
import { Input } from "@jobnest/ui";
import { useCallback, useDeferredValue, useEffect, useState } from "react";
import {
  applicationsApi,
  type ApplicationHistoryEvent,
} from "../../lib/api/applications";
import { ApplicationStatusBadge } from "../application-tracker/application-status-badge";
import { HighlightedText } from "../application-tracker/highlighted-text";
import { getSearchQueryState } from "../application-tracker/helpers";
import { formatDateTime } from "../../lib/date";
import { getErrorMessage } from "../../lib/error-handler";
import { showErrorToast } from "../../lib/toast";

export function ApplicationHistoryScreen() {
  const [events, setEvents] = useState<ApplicationHistoryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);

    try {
      const history = await applicationsApi.listHistory();
      setEvents(history);
    } catch (error) {
      showErrorToast({
        title: "Could not load history",
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const filteredEvents = events.filter((event) =>
    matchesHistoryQuery(event, deferredSearchQuery)
  );

  return (
    <section className="flex h-full min-h-0 w-full flex-col">
      <div className="sticky top-0 z-10 w-full border-b border-border/40 backdrop-blur-xl backdrop-saturate-150 dark:bg-card/50">
        <div className="flex flex-col gap-3 px-4 py-3 sm:px-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2>History</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A complete chronological log of application changes stored on this device.
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs lg:w-72">
            <IconSearch
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              aria-label="Search history"
              autoComplete="off"
              className="pl-9"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search history"
              size="sm"
              type="search"
              value={searchQuery}
            />
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="m-4 rounded-2xl border border-dashed border-border/70 px-5 py-8 text-sm text-muted-foreground sm:m-5">
            Loading history…
          </div>
        ) : null}

        {!isLoading && events.length === 0 ? (
          <div className="m-4 rounded-2xl border border-dashed border-border/70 px-5 py-8 text-sm text-muted-foreground sm:m-5">
            History will appear here once you start adding or editing applications.
          </div>
        ) : null}

        {!isLoading && events.length > 0 && filteredEvents.length === 0 ? (
          <div className="m-4 rounded-2xl border border-dashed border-border/70 px-5 py-8 text-sm text-muted-foreground sm:m-5">
            No history entries match “{searchQuery.trim()}”.
          </div>
        ) : null}

        {!isLoading && filteredEvents.length > 0 ? (
          <div className="bg-background/70">
            <div className="hidden grid-cols-[2.5rem_14rem_minmax(0,1fr)_10rem] gap-3 border-b border-border/50 px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground md:grid">
              <span aria-hidden="true" />
              <span>Event</span>
              <span>Application</span>
              <span>When</span>
            </div>

            <ol>
              {filteredEvents.map((event) => {
                const eventMeta = getEventMeta(event);

                return (
                  <li
                    className="grid gap-3 border-b border-border/50 px-4 py-3 last:border-b-0 md:grid-cols-[2.5rem_14rem_minmax(0,1fr)_10rem] md:items-center"
                    key={event.id}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/70 text-muted-foreground">
                      <eventMeta.icon aria-hidden="true" className="size-3.5" />
                    </div>

                    <div className="min-w-0">
                      {event.eventType === "status_changed" && event.statusTo ? (
                        <div className="flex items-center gap-2 overflow-hidden text-sm text-foreground whitespace-nowrap">
                          <span className="shrink-0">Status change to</span>
                          <span className="min-w-0 shrink-0">
                            <ApplicationStatusBadge status={event.statusTo} />
                          </span>
                        </div>
                      ) : event.eventType === "updated" && eventMeta.detail ? (
                        <div className="flex items-center gap-1 overflow-hidden text-sm text-foreground whitespace-nowrap">
                          <span className="shrink-0">Updated</span>
                          <span className="truncate rounded-sm bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground/90">
                            <HighlightedText
                              query={deferredSearchQuery}
                              text={getUpdatedFieldsLabel(eventMeta.detail)}
                            />
                          </span>
                        </div>
                      ) : (
                        <p className="truncate text-sm text-foreground">
                          <HighlightedText
                            query={deferredSearchQuery}
                            text={eventMeta.label}
                          />
                        </p>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm text-foreground">
                        <HighlightedText
                          query={deferredSearchQuery}
                          text={event.companyName}
                        />
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        <HighlightedText
                          query={deferredSearchQuery}
                          text={event.roleTitle}
                        />
                      </p>
                    </div>

                    <time
                      className="text-xs text-muted-foreground"
                      dateTime={event.occurredAt}
                    >
                      {formatDateTime(event.occurredAt)}
                    </time>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function getEventMeta(event: ApplicationHistoryEvent): {
  icon: typeof IconHistory;
  label: string;
  detail?: string;
} {
  if (event.eventType === "created") {
    return {
      icon: IconFilePlus,
      label: "Created",
    };
  }

  if (event.eventType === "deleted") {
    return {
      icon: IconTrash,
      label: "Deleted",
    };
  }

  if (event.eventType === "updated") {
    const detail = getEventDetail(event);

    return {
      icon: IconEdit,
      label: detail
        ? detail.startsWith("Changed ")
          ? `Updated ${detail.slice("Changed ".length)}`
          : `Updated ${detail}`
        : "Updated",
      detail,
    };
  }

  if (event.eventType === "status_changed") {
    return {
      icon: IconTransitionTop,
      label: "Status change",
      detail: getEventDetail(event),
    };
  }

  return {
    icon: IconHistory,
    label: formatHistoryLabel(event.eventType),
    detail: getEventDetail(event),
  };
}

function getEventDetail(event: ApplicationHistoryEvent): string | undefined {
  if (event.eventType === "status_changed") {
    const fromStatus = event.statusFrom && formatHistoryLabel(event.statusFrom);
    const toStatus = event.statusTo && formatHistoryLabel(event.statusTo);

    if (fromStatus && toStatus) {
      return `${fromStatus} -> ${toStatus}`;
    }

    if (toStatus) {
      return toStatus;
    }
  }

  if (event.details) {
    return event.details;
  }

  return undefined;
}

function formatHistoryLabel(value: string): string {
  return value.split("_").join(" ");
}

function getUpdatedFieldsLabel(detail: string): string {
  return detail.startsWith("Changed ")
    ? detail.slice("Changed ".length)
    : detail;
}

function matchesHistoryQuery(
  event: ApplicationHistoryEvent,
  query: string
): boolean {
  const { hasQuery, normalizedQuery } = getSearchQueryState(query);

  if (!hasQuery) {
    return true;
  }

  return [
    event.companyName,
    event.roleTitle,
    getEventMeta(event).label,
    getEventDetail(event) ?? "",
    event.statusFrom ? formatHistoryLabel(event.statusFrom) : "",
    event.statusTo ? formatHistoryLabel(event.statusTo) : "",
  ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
}
