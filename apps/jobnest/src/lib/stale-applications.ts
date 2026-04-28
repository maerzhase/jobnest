import type { ApplicationListItem } from "./api/applications";

const DAY_MS = 24 * 60 * 60 * 1000;

export const STALE_APPLICATION_AGE_DAYS = 14;

export function isStaleApplication(
  application: ApplicationListItem,
  now = new Date()
): boolean {
  if (application.archivedAt) {
    return false;
  }

  if (application.status === "offer" || application.status === "rejected") {
    return false;
  }

  const updatedAt = toDate(application.updatedAt);
  if (!updatedAt) {
    return false;
  }

  return (
    now.getTime() - updatedAt.getTime() >= STALE_APPLICATION_AGE_DAYS * DAY_MS
  );
}

function toDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
