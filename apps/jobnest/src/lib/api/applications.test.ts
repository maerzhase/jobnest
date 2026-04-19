import { beforeEach, describe, expect, it, vi } from "vitest";
import { applicationsApi } from "./applications";
import type { LocalApiError } from "./client";

const {
  listApplicationsMock,
  createTrackedApplicationMock,
  updateTrackedApplicationMock,
  deleteTrackedApplicationMock,
} = vi.hoisted(() => ({
  listApplicationsMock: vi.fn(),
  createTrackedApplicationMock: vi.fn(),
  updateTrackedApplicationMock: vi.fn(),
  deleteTrackedApplicationMock: vi.fn(),
}));

vi.mock("./bindings", () => ({
  commands: {
    listApplications: listApplicationsMock,
    createTrackedApplication: createTrackedApplicationMock,
    updateTrackedApplication: updateTrackedApplicationMock,
    deleteTrackedApplication: deleteTrackedApplicationMock,
  },
}));

describe("applicationsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists applications through the generated bindings", async () => {
    const applications = [
      {
        status: "saved",
        applications: [
          {
            id: "app_1",
            companyName: "JobNest",
            roleTitle: "Frontend Engineer",
            jobPostUrl: null,
            applicationSource: "direct_application",
            salaryExpectation: null,
            salaryOffer: null,
            status: "saved",
            appliedAt: null,
            firstResponseAt: null,
            notes: null,
            updatedAt: "2026-04-14T00:00:00Z",
            archivedAt: null,
          },
        ],
      },
    ];

    listApplicationsMock.mockResolvedValue(applications);

    await expect(applicationsApi.list()).resolves.toEqual(applications);
    expect(listApplicationsMock).toHaveBeenCalledTimes(1);
  });

  it("creates a tracked application through the generated bindings", async () => {
    const input = {
      jobPostUrl: "https://example.com/jobs/1",
      companyName: "JobNest",
      roleTitle: "Frontend Engineer",
      applicationSource: "direct_application",
      salaryExpectation: null,
      salaryOffer: null,
      status: "saved",
      appliedAt: null,
      firstResponseAt: null,
      notes: "Interesting role",
    };

    createTrackedApplicationMock.mockResolvedValue({
      id: "app_1",
      ...input,
      salaryExpectation: null,
      salaryOffer: null,
      appliedAt: null,
      firstResponseAt: null,
      updatedAt: "2026-04-14T00:00:00Z",
      archivedAt: null,
    });

    await applicationsApi.create(input);

    expect(createTrackedApplicationMock).toHaveBeenCalledWith(input);
  });

  it("updates a tracked application through the generated bindings", async () => {
    const input = {
      applicationId: "app_1",
      jobPostUrl: "https://example.com/jobs/1",
      companyName: "JobNest",
      roleTitle: "Frontend Engineer",
      applicationSource: "external_recruiter",
      salaryExpectation: null,
      salaryOffer: null,
      status: "interview",
      appliedAt: "2026-04-10T00:00:00Z",
      notes: "Recruiter call booked",
    };

    updateTrackedApplicationMock.mockResolvedValue({
      id: "app_1",
      companyName: input.companyName,
      roleTitle: input.roleTitle,
      jobPostUrl: input.jobPostUrl,
      applicationSource: input.applicationSource,
      salaryExpectation: null,
      salaryOffer: null,
      status: input.status,
      appliedAt: input.appliedAt,
      firstResponseAt: null,
      notes: input.notes,
      updatedAt: "2026-04-14T00:00:00Z",
      archivedAt: null,
    });

    await applicationsApi.update(input);

    expect(updateTrackedApplicationMock).toHaveBeenCalledWith(input);
  });

  it("deletes a tracked application through the generated bindings", async () => {
    deleteTrackedApplicationMock.mockResolvedValue(undefined);

    await applicationsApi.remove("app_1");

    expect(deleteTrackedApplicationMock).toHaveBeenCalledWith("app_1");
  });

  it("normalizes binding errors into LocalApiError", async () => {
    listApplicationsMock.mockRejectedValue("database offline");

    await expect(applicationsApi.list()).rejects.toEqual(
      expect.objectContaining<Partial<LocalApiError>>({
        message: "database offline",
        name: "LocalApiError",
      })
    );
  });
});
