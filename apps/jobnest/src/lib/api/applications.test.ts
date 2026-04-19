import { beforeEach, describe, expect, it, vi } from "vitest";
import { applicationsApi } from "./applications";
import type { LocalApiError } from "./client";

const {
  listApplicationsMock,
  listApplicationHistoryMock,
  createTrackedApplicationMock,
  updateTrackedApplicationMock,
  deleteTrackedApplicationMock,
} = vi.hoisted(() => ({
  listApplicationsMock: vi.fn(),
  listApplicationHistoryMock: vi.fn(),
  createTrackedApplicationMock: vi.fn(),
  updateTrackedApplicationMock: vi.fn(),
  deleteTrackedApplicationMock: vi.fn(),
}));

vi.mock("./bindings", () => ({
  commands: {
    listApplications: listApplicationsMock,
    listApplicationHistory: listApplicationHistoryMock,
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
            attachments: [],
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
      attachments: [
        {
          kind: "file",
          fileName: "resume.pdf",
          filePath: "/Users/m3000/Documents/resume.pdf",
          mimeType: "application/pdf",
        },
      ],
    };

    createTrackedApplicationMock.mockResolvedValue({
      id: "app_1",
      ...input,
      salaryExpectation: null,
      salaryOffer: null,
      appliedAt: null,
      firstResponseAt: null,
      attachments: input.attachments,
      updatedAt: "2026-04-14T00:00:00Z",
      archivedAt: null,
    });

    await applicationsApi.create(input);

    expect(createTrackedApplicationMock).toHaveBeenCalledWith(input);
  });

  it("lists history through the generated bindings", async () => {
    const history = [
      {
        id: "history_1",
        applicationId: "app_1",
        eventType: "created",
        occurredAt: "2026-04-14T09:00:00Z",
        companyName: "JobNest",
        roleTitle: "Frontend Engineer",
        statusFrom: null,
        statusTo: "saved",
        details: null,
        snapshot: null,
      },
    ];

    listApplicationHistoryMock.mockResolvedValue(history);

    await expect(applicationsApi.listHistory()).resolves.toEqual(history);
    expect(listApplicationHistoryMock).toHaveBeenCalledTimes(1);
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
      attachments: [
        {
          kind: "file",
          fileName: "cover-letter.pdf",
          filePath: "/Users/m3000/Documents/cover-letter.pdf",
          mimeType: "application/pdf",
        },
      ],
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
      attachments: input.attachments,
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
