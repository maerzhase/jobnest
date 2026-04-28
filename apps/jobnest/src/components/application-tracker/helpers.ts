"use client";

import { formatDate } from "../../lib/date";
import type { ApplicationListItem } from "../../lib/form-mappers";
import { isStaleApplication } from "../../lib/stale-applications";

export function getApplicationTimelineLabel(
  application: ApplicationListItem,
  staleApplicationDays?: number
): string {
  if (isStaleApplication(application, staleApplicationDays)) {
    return `Stale · since ${formatDate(application.updatedAt)}`;
  }

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

export function getSearchQueryState(query?: string) {
  const trimmedQuery = query?.trim() ?? "";

  return {
    hasQuery: trimmedQuery.length > 0,
    normalizedQuery: trimmedQuery.toLocaleLowerCase(),
    trimmedQuery,
  };
}
