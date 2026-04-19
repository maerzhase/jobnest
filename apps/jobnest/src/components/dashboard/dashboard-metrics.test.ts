import { describe, expect, it } from "vitest";
import { buildDashboardMetrics } from "./dashboard-metrics";

describe("buildDashboardMetrics", () => {
  it("builds dashboard metrics from grouped applications and history", () => {
    const metrics = buildDashboardMetrics(
      [
        {
          status: "interview",
          applications: [
            {
              id: "app_1",
              companyName: "Orbit",
              roleTitle: "Product Designer",
              jobPostUrl: null,
              applicationSource: "referral",
              salaryExpectation: null,
              salaryOffer: null,
              status: "interview",
              appliedAt: "2026-04-01T00:00:00Z",
              firstResponseAt: null,
              notes: null,
              attachments: [],
              updatedAt: "2026-04-16T00:00:00Z",
              archivedAt: null,
            },
          ],
        },
        {
          status: "offer",
          applications: [
            {
              id: "app_2",
              companyName: "Northstar",
              roleTitle: "Frontend Engineer",
              jobPostUrl: null,
              applicationSource: "direct_application",
              salaryExpectation: null,
              salaryOffer: "EUR 95k",
              status: "offer",
              appliedAt: "2026-04-05T00:00:00Z",
              firstResponseAt: null,
              notes: null,
              attachments: [],
              updatedAt: "2026-04-18T00:00:00Z",
              archivedAt: null,
            },
          ],
        },
        {
          status: "rejected",
          applications: [
            {
              id: "app_3",
              companyName: "Delta",
              roleTitle: "Design Systems Engineer",
              jobPostUrl: null,
              applicationSource: "external_recruiter",
              salaryExpectation: null,
              salaryOffer: null,
              status: "rejected",
              appliedAt: "2026-03-20T00:00:00Z",
              firstResponseAt: null,
              notes: null,
              attachments: [],
              updatedAt: "2026-03-28T00:00:00Z",
              archivedAt: null,
            },
          ],
        },
        {
          status: "saved",
          applications: [
            {
              id: "app_4",
              companyName: "Acme",
              roleTitle: "UX Engineer",
              jobPostUrl: null,
              applicationSource: "direct_application",
              salaryExpectation: null,
              salaryOffer: null,
              status: "saved",
              appliedAt: null,
              firstResponseAt: null,
              notes: null,
              attachments: [],
              updatedAt: "2026-03-20T00:00:00Z",
              archivedAt: null,
            },
          ],
        },
      ],
      [
        {
          id: "hist_4",
          applicationId: "app_1",
          eventType: "status_changed",
          occurredAt: "2026-04-11T00:00:00Z",
          companyName: "Orbit",
          roleTitle: "Product Designer",
          statusFrom: "applied",
          statusTo: "interview",
          details: null,
          snapshot: null,
        },
        {
          id: "hist_3",
          applicationId: "app_2",
          eventType: "status_changed",
          occurredAt: "2026-04-15T00:00:00Z",
          companyName: "Northstar",
          roleTitle: "Frontend Engineer",
          statusFrom: "interview",
          statusTo: "offer",
          details: null,
          snapshot: null,
        },
        {
          id: "hist_2",
          applicationId: "app_3",
          eventType: "status_changed",
          occurredAt: "2026-03-28T00:00:00Z",
          companyName: "Delta",
          roleTitle: "Design Systems Engineer",
          statusFrom: "applied",
          statusTo: "rejected",
          details: null,
          snapshot: null,
        },
        {
          id: "hist_1",
          applicationId: "app_4",
          eventType: "created",
          occurredAt: "2026-03-18T00:00:00Z",
          companyName: "Acme",
          roleTitle: "UX Engineer",
          statusFrom: null,
          statusTo: "saved",
          details: null,
          snapshot: null,
        },
      ],
      new Date("2026-04-19T12:00:00Z")
    );

    expect(metrics.totalApplications).toBe(4);
    expect(metrics.activeApplications).toBe(3);
    expect(metrics.staleApplications).toBe(1);
    expect(metrics.interviewRate).toBe(25);
    expect(metrics.offerRate).toBe(25);
    expect(metrics.rejectionRate).toBe(25);
    expect(metrics.averageDaysToInterview).toBe(10);
    expect(metrics.averageDaysToOffer).toBe(10);
    expect(metrics.statusBreakdown.find((item) => item.status === "saved")?.count).toBe(1);
    expect(metrics.sourceBreakdown.find((item) => item.source === "referral")?.interviews).toBe(1);
    expect(metrics.latestEventAt).toBe("2026-04-11T00:00:00Z");
  });
});
