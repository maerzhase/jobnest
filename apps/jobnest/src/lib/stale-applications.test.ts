import { describe, expect, it } from "vitest";
import { isStaleApplication } from "./stale-applications";

describe("isStaleApplication", () => {
  const now = new Date("2026-04-28T12:00:00Z");

  it("marks active applications as stale after fourteen days without updates", () => {
    expect(
      isStaleApplication(
        {
          id: "app_1",
          companyName: "Orbit",
          roleTitle: "Product Designer",
          jobPostUrl: null,
          applicationSource: "referral",
          salaryExpectation: null,
          salaryOffer: null,
          status: "applied",
          appliedAt: "2026-04-01T00:00:00Z",
          firstResponseAt: null,
          notes: null,
          attachments: [],
          updatedAt: "2026-04-14T12:00:00Z",
          archivedAt: null,
        },
        now
      )
    ).toBe(true);
  });

  it("does not mark fresh, archived, or closed applications as stale", () => {
    expect(
      isStaleApplication(
        {
          id: "app_2",
          companyName: "Northstar",
          roleTitle: "Frontend Engineer",
          jobPostUrl: null,
          applicationSource: "direct_application",
          salaryExpectation: null,
          salaryOffer: null,
          status: "interview",
          appliedAt: "2026-04-05T00:00:00Z",
          firstResponseAt: null,
          notes: null,
          attachments: [],
          updatedAt: "2026-04-20T12:00:00Z",
          archivedAt: null,
        },
        now
      )
    ).toBe(false);

    expect(
      isStaleApplication(
        {
          id: "app_3",
          companyName: "Delta",
          roleTitle: "Design Systems Engineer",
          jobPostUrl: null,
          applicationSource: "external_recruiter",
          salaryExpectation: null,
          salaryOffer: null,
          status: "saved",
          appliedAt: null,
          firstResponseAt: null,
          notes: null,
          attachments: [],
          updatedAt: "2026-04-01T00:00:00Z",
          archivedAt: "2026-04-10T00:00:00Z",
        },
        now
      )
    ).toBe(false);

    expect(
      isStaleApplication(
        {
          id: "app_4",
          companyName: "Acme",
          roleTitle: "UX Engineer",
          jobPostUrl: null,
          applicationSource: "direct_application",
          salaryExpectation: null,
          salaryOffer: null,
          status: "offer",
          appliedAt: "2026-04-01T00:00:00Z",
          firstResponseAt: null,
          notes: null,
          attachments: [],
          updatedAt: "2026-04-01T00:00:00Z",
          archivedAt: null,
        },
        now
      )
    ).toBe(false);
  });
});
