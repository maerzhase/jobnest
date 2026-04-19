import type {
  ApplicationHistoryEvent,
  ApplicationListItem,
  ApplicationStatusGroup,
} from "../../lib/api/applications";
import {
  APPLICATION_SOURCE_OPTIONS,
  type ApplicationSource,
} from "../../lib/application-source";
import { STATUS_OPTIONS, type ApplicationStatus } from "../../lib/status";

const DAY_MS = 24 * 60 * 60 * 1000;
const ACTIVE_STATUSES = new Set<ApplicationStatus>([
  "saved",
  "applied",
  "interview",
  "offer",
]);

export type StatusMetric = {
  status: ApplicationStatus;
  label: string;
  count: number;
  share: number;
};

export type WeeklyBucket = {
  label: string;
  count: number;
};

export type SourceMetric = {
  source: ApplicationSource;
  label: string;
  count: number;
  interviews: number;
  offers: number;
  conversionRate: number;
};

export type RecentActivityMetric = {
  label: string;
  count: number;
};

export type DashboardMetrics = {
  totalApplications: number;
  activeApplications: number;
  archivedApplications: number;
  staleApplications: number;
  interviewRate: number;
  offerRate: number;
  rejectionRate: number;
  averageDaysToInterview: number | null;
  averageDaysToOffer: number | null;
  statusBreakdown: StatusMetric[];
  weeklyApplications: WeeklyBucket[];
  recentActivity: RecentActivityMetric[];
  sourceBreakdown: SourceMetric[];
  latestEventAt: string | null;
};

export function buildDashboardMetrics(
  groups: ApplicationStatusGroup[],
  history: ApplicationHistoryEvent[],
  now = new Date()
): DashboardMetrics {
  const applications = groups.flatMap((group) => group.applications);
  const totalApplications = applications.length;
  const activeApplications = applications.filter(
    (application) =>
      ACTIVE_STATUSES.has(application.status as ApplicationStatus) &&
      application.archivedAt === null
  ).length;
  const archivedApplications = applications.filter(
    (application) => application.archivedAt !== null
  ).length;
  const staleApplications = applications.filter((application) =>
    isStaleApplication(application, now)
  ).length;

  const lifecycleByApplication = groupHistoryByApplication(history);
  const applicationsThatReachedInterview = applications.filter((application) =>
    hasReachedStatus(application, lifecycleByApplication, "interview")
  ).length;
  const applicationsThatReachedOffer = applications.filter((application) =>
    hasReachedStatus(application, lifecycleByApplication, "offer")
  ).length;
  const rejectedApplications = applications.filter((application) =>
    hasReachedStatus(application, lifecycleByApplication, "rejected")
  ).length;

  return {
    totalApplications,
    activeApplications,
    archivedApplications,
    staleApplications,
    interviewRate: getRate(applicationsThatReachedInterview, totalApplications),
    offerRate: getRate(applicationsThatReachedOffer, totalApplications),
    rejectionRate: getRate(rejectedApplications, totalApplications),
    averageDaysToInterview: getAverageDaysToStatus(
      applications,
      lifecycleByApplication,
      "interview"
    ),
    averageDaysToOffer: getAverageDaysToStatus(
      applications,
      lifecycleByApplication,
      "offer"
    ),
    statusBreakdown: buildStatusBreakdown(applications),
    weeklyApplications: buildWeeklyApplications(history, now),
    recentActivity: buildRecentActivity(history, now),
    sourceBreakdown: buildSourceBreakdown(applications, lifecycleByApplication),
    latestEventAt: history[0]?.occurredAt ?? null,
  };
}

function buildStatusBreakdown(
  applications: ApplicationListItem[]
): StatusMetric[] {
  const total = applications.length;

  return STATUS_OPTIONS.map((statusOption) => {
    const count = applications.filter(
      (application) => application.status === statusOption.value
    ).length;

    return {
      status: statusOption.value,
      label: statusOption.label,
      count,
      share: getRate(count, total),
    };
  });
}

function buildWeeklyApplications(
  history: ApplicationHistoryEvent[],
  now: Date
): WeeklyBucket[] {
  const currentWeekStart = getStartOfWeek(now);
  const buckets = Array.from({ length: 8 }, (_, index) => {
    const date = new Date(currentWeekStart);
    date.setUTCDate(currentWeekStart.getUTCDate() - (7 - index) * 7);

    return {
      date,
      label: date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      count: 0,
    };
  });

  for (const event of history) {
    if (event.eventType !== "created") {
      continue;
    }

    const occurredAt = new Date(event.occurredAt);
    if (Number.isNaN(occurredAt.getTime())) {
      continue;
    }

    const weekStart = getStartOfWeek(occurredAt).getTime();
    const bucket = buckets.find((candidate) => candidate.date.getTime() === weekStart);

    if (bucket) {
      bucket.count += 1;
    }
  }

  return buckets.map(({ label, count }) => ({ label, count }));
}

function buildRecentActivity(
  history: ApplicationHistoryEvent[],
  now: Date
): RecentActivityMetric[] {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - 13);

  const buckets = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);

    return {
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      count: 0,
    };
  });

  for (const event of history) {
    const dateKey = event.occurredAt.slice(0, 10);
    const bucket = buckets.find((candidate) => candidate.key === dateKey);

    if (bucket) {
      bucket.count += 1;
    }
  }

  return buckets.map(({ label, count }) => ({ label, count }));
}

function buildSourceBreakdown(
  applications: ApplicationListItem[],
  lifecycleByApplication: Map<string, ApplicationHistoryEvent[]>
): SourceMetric[] {
  return APPLICATION_SOURCE_OPTIONS.map((sourceOption) => {
    const sourceApplications = applications.filter(
      (application) => application.applicationSource === sourceOption.value
    );
    const interviews = sourceApplications.filter((application) =>
      hasReachedStatus(application, lifecycleByApplication, "interview")
    ).length;
    const offers = sourceApplications.filter((application) =>
      hasReachedStatus(application, lifecycleByApplication, "offer")
    ).length;

    return {
      source: sourceOption.value,
      label: sourceOption.label,
      count: sourceApplications.length,
      interviews,
      offers,
      conversionRate: getRate(interviews, sourceApplications.length),
    };
  }).filter((sourceMetric) => sourceMetric.count > 0);
}

function groupHistoryByApplication(
  history: ApplicationHistoryEvent[]
): Map<string, ApplicationHistoryEvent[]> {
  const map = new Map<string, ApplicationHistoryEvent[]>();

  for (const event of history) {
    const events = map.get(event.applicationId) ?? [];
    events.push(event);
    map.set(event.applicationId, events);
  }

  for (const events of map.values()) {
    events.sort(
      (left, right) =>
        new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime()
    );
  }

  return map;
}

function hasReachedStatus(
  application: ApplicationListItem,
  lifecycleByApplication: Map<string, ApplicationHistoryEvent[]>,
  status: ApplicationStatus
): boolean {
  if (application.status === status) {
    return true;
  }

  const history = lifecycleByApplication.get(application.id) ?? [];

  return history.some(
    (event) =>
      event.statusTo === status ||
      event.snapshot?.status === status
  );
}

function getAverageDaysToStatus(
  applications: ApplicationListItem[],
  lifecycleByApplication: Map<string, ApplicationHistoryEvent[]>,
  status: ApplicationStatus
): number | null {
  const durations = applications
    .map((application) => {
      const reachedAt = getStatusReachedAt(
        application,
        lifecycleByApplication.get(application.id) ?? [],
        status
      );
      const startedAt = getApplicationStartDate(
        application,
        lifecycleByApplication.get(application.id) ?? []
      );

      if (!reachedAt || !startedAt) {
        return null;
      }

      const duration = Math.round(
        (reachedAt.getTime() - startedAt.getTime()) / DAY_MS
      );

      return duration >= 0 ? duration : null;
    })
    .filter((value): value is number => value !== null);

  if (durations.length === 0) {
    return null;
  }

  return Math.round(
    durations.reduce((sum, duration) => sum + duration, 0) / durations.length
  );
}

function getApplicationStartDate(
  application: ApplicationListItem,
  history: ApplicationHistoryEvent[]
): Date | null {
  const appliedAt = toDate(application.appliedAt);
  if (appliedAt) {
    return appliedAt;
  }

  const createdEvent = history.find((event) => event.eventType === "created");
  return toDate(createdEvent?.occurredAt ?? null);
}

function getStatusReachedAt(
  application: ApplicationListItem,
  history: ApplicationHistoryEvent[],
  status: ApplicationStatus
): Date | null {
  if (application.status === status) {
    const matchingEvent = history.find((event) => event.statusTo === status);
    if (matchingEvent) {
      return toDate(matchingEvent.occurredAt);
    }
  }

  const event = history.find((candidate) => candidate.statusTo === status);
  return toDate(event?.occurredAt ?? null);
}

function isStaleApplication(application: ApplicationListItem, now: Date): boolean {
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

  return now.getTime() - updatedAt.getTime() >= 14 * DAY_MS;
}

function getRate(count: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  return Math.round((count / total) * 100);
}

function getStartOfWeek(date: Date): Date {
  const normalized = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const day = normalized.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  normalized.setUTCDate(normalized.getUTCDate() + diff);
  return normalized;
}

function toDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
